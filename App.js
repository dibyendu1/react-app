import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useEffect, useState } from 'react';
import useBLE from './useBLE';
import DeviceModal from './DeviceConnectionModal';

export default function App() {
  const {
    requestPermissions,
    scanForPeripherals,
    checkBluetoothState,
    allDevices,
    stopScanning,
  } = useBLE();

  const [isModalVisible, setIsModalVisible] = useState(false);

  // Check Bluetooth state and request permissions when the app starts
  useEffect(() => {
    checkBluetoothState();  // Checks if Bluetooth is enabled
  }, []);

  // Function to scan for devices when user clicks "Connect"
  const handleConnectPress = async () => {
    const permissionGranted = await requestPermissions();  // Request permissions dynamically
    if (permissionGranted) {
      console.log('Permissions granted. Scanning for devices...');
      scanForPeripherals();  // Start scanning for devices
      setIsModalVisible(true);  // Show the modal with devices
    } else {
      console.log('Permissions denied.');
    }
  };

  // Close the modal and stop scanning when the user closes the modal
  const hideModal = () => {
    stopScanning();  // Stop scanning when the modal is closed
    setIsModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <Text>Bluetooth Device Scanner</Text>
        <StatusBar style="auto" />
        <TouchableOpacity
          onPress={handleConnectPress}
          style={styles.ctaButton}
        >
          <Text style={styles.ctaButtonText}>{"Connect"}</Text>
        </TouchableOpacity>
        <DeviceModal
          closeModal={hideModal}
          visible={isModalVisible}
          connectToPeripheral={() => {}}
          devices={allDevices}  // Pass found devices to the modal
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
