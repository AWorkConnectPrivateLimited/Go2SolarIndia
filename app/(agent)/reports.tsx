import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button, SegmentedButtons, useTheme, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function AgentReports() {
  const theme = useTheme();
  const [reportType, setReportType] = useState('installations');

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: theme.colors.background,
    },
    header: {
      marginBottom: 24,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.onSurfaceVariant,
    },
    segmentedButtons: {
      marginBottom: 16,
    },
    card: {
      marginBottom: 16,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 16,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    label: {
      fontSize: 16,
      color: theme.colors.onSurfaceVariant,
    },
    value: {
      fontSize: 16,
      fontWeight: '500',
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 16,
    },
    button: {
      flex: 1,
      marginHorizontal: 4,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 12,
    },
    reportItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
    },
    reportInfo: {
      flex: 1,
    },
    reportTitle: {
      fontSize: 16,
      fontWeight: '500',
      marginBottom: 4,
    },
    reportDate: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
    },
    reportStatus: {
      fontSize: 14,
      fontWeight: '500',
    },
    statusPending: {
      color: theme.colors.error,
    },
    statusCompleted: {
      color: theme.colors.primary,
    },
  });

  // Mock data for reports
  const reportsData = {
    installations: [
      { id: 1, title: 'Monthly Installation Report', date: '2023-04-01', status: 'completed' },
      { id: 2, title: 'Weekly Installation Summary', date: '2023-04-15', status: 'completed' },
      { id: 3, title: 'Daily Installation Report', date: '2023-04-20', status: 'pending' },
    ],
    sales: [
      { id: 1, title: 'Monthly Sales Report', date: '2023-04-01', status: 'completed' },
      { id: 2, title: 'Weekly Sales Summary', date: '2023-04-15', status: 'completed' },
      { id: 3, title: 'Daily Sales Report', date: '2023-04-20', status: 'pending' },
    ],
    performance: [
      { id: 1, title: 'Monthly Performance Report', date: '2023-04-01', status: 'completed' },
      { id: 2, title: 'Weekly Performance Summary', date: '2023-04-15', status: 'completed' },
      { id: 3, title: 'Daily Performance Report', date: '2023-04-20', status: 'pending' },
    ],
  };

  const currentReports = reportsData[reportType as keyof typeof reportsData];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Reports</Text>
        <Text style={styles.subtitle}>View and generate reports</Text>
      </View>

      <SegmentedButtons
        value={reportType}
        onValueChange={setReportType}
        buttons={[
          { value: 'installations', label: 'Installations' },
          { value: 'sales', label: 'Sales' },
          { value: 'performance', label: 'Performance' },
        ]}
        style={styles.segmentedButtons}
      />

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.cardTitle}>Generate New Report</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Report Type</Text>
            <Text style={styles.value}>{reportType.charAt(0).toUpperCase() + reportType.slice(1)}</Text>
          </View>
          <Divider style={{ marginVertical: 8 }} />
          <View style={styles.row}>
            <Text style={styles.label}>Date Range</Text>
            <Text style={styles.value}>Last 30 Days</Text>
          </View>
          <Divider style={{ marginVertical: 8 }} />
          <View style={styles.row}>
            <Text style={styles.label}>Format</Text>
            <Text style={styles.value}>PDF</Text>
          </View>
          <View style={styles.buttonContainer}>
            <Button 
              mode="outlined" 
              icon="file-pdf-box" 
              style={styles.button}
              onPress={() => {}}
            >
              PDF
            </Button>
            <Button 
              mode="outlined" 
              icon="file-excel" 
              style={styles.button}
              onPress={() => {}}
            >
              Excel
            </Button>
          </View>
        </Card.Content>
      </Card>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Reports</Text>
        <Card style={styles.card}>
          <Card.Content>
            {currentReports.map((report) => (
              <React.Fragment key={report.id}>
                <View style={styles.reportItem}>
                  <View style={styles.reportInfo}>
                    <Text style={styles.reportTitle}>{report.title}</Text>
                    <Text style={styles.reportDate}>{report.date}</Text>
                  </View>
                  <Text 
                    style={[
                      styles.reportStatus, 
                      report.status === 'completed' ? styles.statusCompleted : styles.statusPending
                    ]}
                  >
                    {report.status === 'completed' ? 'Completed' : 'Pending'}
                  </Text>
                </View>
                {report.id !== currentReports.length && <Divider style={{ marginVertical: 8 }} />}
              </React.Fragment>
            ))}
          </Card.Content>
        </Card>
      </View>
    </ScrollView>
  );
} 