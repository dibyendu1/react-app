// screens/SettingsScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';
import useBLE from '../useBLE';
import DeviceModal from '../DeviceConnectionModal';

const SettingsScreen = () => {
  const {
    requestPermissions,
    scanForPeripherals,
    scanForClassicDevices,
    checkBluetoothState,
    allDevices,
    classicDevices,
    stopScanning,
    resetDeviceLists,
  } = useBLE();

  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    checkBluetoothState();
  }, []);

  const handleAddDevicePress = async () => {
    try {
      resetDeviceLists();
      const permissionGranted = await requestPermissions();
      if (permissionGranted) {
        console.log('Permissions granted. Starting scan...');
        scanForPeripherals();
        setIsModalVisible(true);
        await scanForClassicDevices();
      } else {
        console.log('Permissions denied.');
      }
    } catch (error) {
      console.error('Error during device scan:', error);
    }
  };

  const combinedDevices = [...allDevices, ...classicDevices];

  const hideModal = () => {
    stopScanning();
    setIsModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <TouchableOpacity onPress={handleAddDevicePress} style={styles.addDeviceButton}>
        <Text style={styles.addDeviceButtonText}>Add Device</Text>
      </TouchableOpacity>
      <DeviceModal
        closeModal={hideModal}
        visible={isModalVisible}
        connectToPeripheral={() => {}}
        devices={combinedDevices}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  addDeviceButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginBottom: 10,
  },
  addDeviceButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SettingsScreen;
