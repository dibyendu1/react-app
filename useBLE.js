import { useMemo, useState } from "react";
import { PermissionsAndroid, Platform, Alert, Linking } from "react-native";
import { BleManager } from "react-native-ble-plx";
import * as ExpoDevice from "expo-device";

function useBLE() {
  const bleManager = useMemo(() => new BleManager(), []);
  const [allDevices, setAllDevices] = useState([]);
  const [connectedDevice, setConnectedDevice] = useState(null);

  // Request permissions for Android 12+ (API level 31+)
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

  // Request permissions for pre-Android 12 (below API level 31)
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
      return true; // On iOS, permissions are granted automatically
    }
  };

  // Check Bluetooth state and prompt user if disabled
  const checkBluetoothState = () => {
    bleManager.onStateChange((state) => {
      if (state === "PoweredOff") {
        Alert.alert(
          "Bluetooth is off",
          "Please turn on Bluetooth to use this app",
          [
            {
              text: "Turn On",
              onPress: () => Linking.openSettings(), // Opens Bluetooth settings
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

  // Prevent adding duplicate devices
  const isDuplicateDevice = (devices, nextDevice) => {
    return devices.some((device) => device.id === nextDevice.id);
  };

  // Start continuous scanning for BLE devices
  const scanForPeripherals = () => {
    console.log("Starting device scan...");
    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.error("Error during scan:", error.message);
        return;
      }

      // Check for both `device.name` and `device.localName`
      const deviceName = device.name || device.localName || "Unnamed device";

      if (device?.id) {
        setAllDevices((prevState) => {
          if (!isDuplicateDevice(prevState, device)) {
            console.log("Found device:", deviceName);
            return [...prevState, { ...device, name: deviceName }];
          }
          return prevState; // Do not add duplicates
        });
      }
    });
  };

  // Stop scanning for BLE devices
  const stopScanning = () => {
    console.log("Stopping device scan...");
    bleManager.stopDeviceScan();
  };

  return {
    requestPermissions,
    scanForPeripherals,
    stopScanning,
    checkBluetoothState,  // Include this in the return
    allDevices,
    connectedDevice,
  };
}

export default useBLE;
