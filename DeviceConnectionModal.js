import React, { useCallback } from "react";
import {
  FlatList,
  Modal,
  SafeAreaView,
  Text,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

// List item component for rendering each device
const DeviceModalListItem = ({ item, connectToPeripheral, closeModal }) => {
  const connectAndCloseModal = useCallback(() => {
    connectToPeripheral(item);
    closeModal();
  }, [closeModal, connectToPeripheral, item]);

  return (
    <TouchableOpacity onPress={connectAndCloseModal} style={modalStyle.ctaButton}>
      <Text style={modalStyle.ctaButtonText}>
        {item.name || item.id || "Unnamed device"} {/* Show name or fallback to MAC (id) */}
      </Text>
    </TouchableOpacity>
  );
};

// Main Modal component to show the list of devices
const DeviceModal = ({ devices, visible, connectToPeripheral, closeModal }) => {
  const renderDeviceModalListItem = useCallback(
    ({ item }) => (
      <DeviceModalListItem
        item={item}
        connectToPeripheral={connectToPeripheral}
        closeModal={closeModal}
      />
    ),
    [closeModal, connectToPeripheral]
  );

  return (
    <Modal
      style={modalStyle.modalContainer}
      animationType="slide"
      transparent={false}
      visible={visible}
    >
      <SafeAreaView style={modalStyle.modalTitle}>
        <Text style={modalStyle.modalTitleText}>
          Tap on a device to connect
        </Text>
        <FlatList
          contentContainerStyle={modalStyle.modalFlatlistContainer}
          data={devices}
          keyExtractor={(item) => item.key}  /* Ensuring unique key for every item */
          renderItem={renderDeviceModalListItem}
        />
        <View style={modalStyle.closeButtonContainer}>
          <TouchableOpacity onPress={closeModal} style={modalStyle.ctaButton}>
            <Text style={modalStyle.ctaButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const modalStyle = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "#f2f2f2",
  },
  modalFlatlistContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  modalTitle: {
    flex: 1,
    backgroundColor: "#f2f2f2",
  },
  modalTitleText: {
    marginTop: 40,
    fontSize: 30,
    fontWeight: "bold",
    marginHorizontal: 20,
    textAlign: "center",
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
  closeButtonContainer: {
    marginBottom: 20,
    alignItems: "center",
  },
});

export default DeviceModal;
