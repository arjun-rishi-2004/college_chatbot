// BackButton.js
import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import PropTypes from 'prop-types';

const BackButton = ({ onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    style={{
      backgroundColor: '#ddd',
      borderRadius: 5,
      padding: 10,
      marginTop: 5,
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <Text style={{ color: '#333', fontSize: 16, fontWeight: 'bold' }}>Back</Text>
  </TouchableOpacity>
);

BackButton.propTypes = {
  onPress: PropTypes.func.isRequired,
};

export default BackButton;
