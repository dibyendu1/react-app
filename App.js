import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useEffect, useState } from 'react';
import useBLE from './useBLE';
import DeviceModal from './DeviceConnectionModal';

export default function App() {
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

  const handleConnectPress = async () => {
    try {
      resetDeviceLists();
      const permissionGranted = await requestPermissions();
      if (permissionGranted) {
        console.log('Permissions granted. Starting BLE scan...');
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
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <Text>Bluetooth Device Scanner</Text>
        <StatusBar style="auto" />
        <TouchableOpacity onPress={handleConnectPress} style={styles.ctaButton}>
          <Text style={styles.ctaButtonText}>Connect</Text>
        </TouchableOpacity>
        <DeviceModal
          closeModal={hideModal}
          visible={isModalVisible}
          connectToPeripheral={() => {}}
          devices={combinedDevices}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaButton: {
    backgroundColor: "#FF6060",
    justifyContent: "center",
    alignItems: "center",
    height: 50,
    marginHorizontal: 20,
    marginBottom: 5,
    borderRadius: 8,
  },
  ctaButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
});
