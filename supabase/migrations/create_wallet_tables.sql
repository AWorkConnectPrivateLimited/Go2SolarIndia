-- Create digital_wallet table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.digital_wallet (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create wallet_transactions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_id UUID NOT NULL REFERENCES public.digital_wallet(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('credit', 'debit')),
  amount INTEGER NOT NULL,
  description TEXT,
  reference_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payouts table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL CHECK (status IN ('pending', 'processed', 'failed')),
  account_number TEXT NOT NULL,
  ifsc TEXT NOT NULL,
  reference_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for tables
ALTER TABLE public.digital_wallet ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for digital_wallet if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'digital_wallet' AND policyname = 'Users can view their own wallet'
  ) THEN
    CREATE POLICY "Users can view their own wallet"
      ON public.digital_wallet
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'digital_wallet' AND policyname = 'Users can update their own wallet'
  ) THEN
    CREATE POLICY "Users can update their own wallet"
      ON public.digital_wallet
      FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'digital_wallet' AND policyname = 'Users can create their own wallet'
  ) THEN
    CREATE POLICY "Users can create their own wallet"
      ON public.digital_wallet
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END
$$;

-- Create RLS policies for wallet_transactions if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'wallet_transactions' AND policyname = 'Users can view their own transactions'
  ) THEN
    CREATE POLICY "Users can view their own transactions"
      ON public.wallet_transactions
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.digital_wallet
          WHERE id = wallet_id AND user_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'wallet_transactions' AND policyname = 'Users can create their own transactions'
  ) THEN
    CREATE POLICY "Users can create their own transactions"
      ON public.wallet_transactions
      FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.digital_wallet
          WHERE id = wallet_id AND user_id = auth.uid()
        )
      );
  END IF;
END
$$;

-- Create RLS policies for payouts if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'payouts' AND policyname = 'Users can view their own payouts'
  ) THEN
    CREATE POLICY "Users can view their own payouts"
      ON public.payouts
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'payouts' AND policyname = 'Users can create their own payouts'
  ) THEN
    CREATE POLICY "Users can create their own payouts"
      ON public.payouts
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END
$$;

-- Create function to update wallet balance if it doesn't exist
CREATE OR REPLACE FUNCTION update_wallet_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.type = 'credit' THEN
    UPDATE public.digital_wallet
    SET balance = balance + NEW.amount,
        last_updated = NOW()
    WHERE id = NEW.wallet_id;
  ELSIF NEW.type = 'debit' THEN
    UPDATE public.digital_wallet
    SET balance = balance - NEW.amount,
        last_updated = NOW()
    WHERE id = NEW.wallet_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update wallet balance on transaction if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_wallet_balance_trigger'
  ) THEN
    CREATE TRIGGER update_wallet_balance_trigger
    AFTER INSERT ON public.wallet_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_wallet_balance();
  END IF;
END
$$; 