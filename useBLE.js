import { useMemo, useState } from "react";
import { PermissionsAndroid, Platform, Alert, Linking } from "react-native";
import { BleManager } from "react-native-ble-plx";
import BluetoothClassic from 'react-native-bluetooth-classic';
import * as ExpoDevice from "expo-device";

function useBLE() {
  const bleManager = useMemo(() => new BleManager(), []);
  const [allDevices, setAllDevices] = useState([]);
  const [classicDevices, setClassicDevices] = useState([]);
  const [connectedDevice, setConnectedDevice] = useState(null);
  const [discoveredDeviceIds, setDiscoveredDeviceIds] = useState(new Set());  // Track discovered BLE devices

  // Reset the device lists and discovered IDs when closing or before starting a new scan
  const resetDeviceLists = () => {
    setAllDevices([]);
    setClassicDevices([]);
    setDiscoveredDeviceIds(new Set());  // Reset discovered device IDs
  };

  const requestAndroid31Permissions = async () => {
    const bluetoothScanPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      {
        title: "Bluetooth Scan Permission",
        message: "App needs access to Bluetooth scan",
        buttonPositive: "OK",
      }
    );

    const bluetoothConnectPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      {
        title: "Bluetooth Connect Permission",
        message: "App needs access to Bluetooth connect",
        buttonPositive: "OK",
      }
    );

    const locationPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: "Location Permission",
        message: "Bluetooth Low Energy requires Location",
        buttonPositive: "OK",
      }
    );

    return (
      bluetoothScanPermission === PermissionsAndroid.RESULTS.GRANTED &&
      bluetoothConnectPermission === PermissionsAndroid.RESULTS.GRANTED &&
      locationPermission === PermissionsAndroid.RESULTS.GRANTED
    );
  };

  const openBluetoothSettings = () => {
    if (Platform.OS === "android") {
      Linking.openURL('android.settings.BLUETOOTH_SETTINGS');
    } else if (Platform.OS === "ios") {
      Linking.openURL('App-Prefs:root=Bluetooth'); // Works for iOS 11+ 
    } else {
      Alert.alert("Platform not supported");
    }
  };

  const requestPermissions = async () => {
    if (Platform.OS === "android") {
      if ((ExpoDevice.platformApiLevel ?? -1) < 31) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "Location Permission",
            message: "Bluetooth Low Energy requires Location",
            buttonPositive: "OK",
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        return await requestAndroid31Permissions();
      }
    } else {
      return true;  // iOS permissions are granted automatically
    }
  };

  const checkBluetoothState = () => {
    bleManager.onStateChange((state) => {
      if (state === "PoweredOff") {
        Alert.alert(
          "Bluetooth is off",
          "Please turn on Bluetooth to use this app",
          [
            {
              text: "Turn On",
              onPress: openBluetoothSettings,
            },
            {
              text: "Cancel",
              style: "cancel",
            },
          ]
        );
      } else if (state === "PoweredOn") {
        console.log("Bluetooth is on and ready.");
      }
    }, true);
  };

  // Add or update device in the list
  const addOrUpdateDevice = (deviceList, newDevice, type) => {
    const existingDeviceIndex = deviceList.findIndex(
      (device) => device.id === newDevice.id && device.type === type
    );

    if (existingDeviceIndex > -1) {
      const updatedDevices = [...deviceList];
      updatedDevices[existingDeviceIndex] = { ...updatedDevices[existingDeviceIndex], ...newDevice };
      return updatedDevices;
    } else {
      return [...deviceList, { ...newDevice, type, key: `${type}_${newDevice.id}` }];
    }
  };

  // Scan for Bluetooth Classic devices
  const scanForClassicDevices = async () => {
    try {
      const devices = await BluetoothClassic.startDiscovery();
      console.log("Found Bluetooth Classic devices:", devices);
      setClassicDevices((prevDevices) =>
        devices.reduce(
          (deviceList, device) =>
            addOrUpdateDevice(deviceList, { ...device }, 'Classic'),
          prevDevices
        )
      );
    } catch (error) {
      console.error("Error scanning for Bluetooth Classic devices:", error);
    }
  };

  // Start scanning for BLE devices, prevent duplicates
  const scanForPeripherals = () => {
    console.log("Starting BLE device scan...");
    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.error("Error during BLE scan:", error.message);
        return;
      }

      if (device?.id && !discoveredDeviceIds.has(device.id)) {
        setDiscoveredDeviceIds((prevSet) => new Set(prevSet).add(device.id));  // Mark device as discovered
        const deviceName = device.name || device.localName || "Unnamed device";
        setAllDevices((prevDevices) =>
          addOrUpdateDevice(prevDevices, { ...device, name: deviceName }, 'BLE')
        );
      }
    });
  };

  const stopScanning = () => {
    console.log("Stopping device scan...");
    bleManager.stopDeviceScan();
  };

  return {
    requestPermissions,
    scanForPeripherals,
    scanForClassicDevices,
    stopScanning,
    resetDeviceLists,
    checkBluetoothState,
    allDevices,
    classicDevices,
    connectedDevice,
  };
}

export default useBLE;
