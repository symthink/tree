import React from 'react';
import { View, Text, Button } from 'react-native';
import { useAnimation } from './AnimationContext';

export const AnimationTest: React.FC = () => {
  const { state, dispatch } = useAnimation();

  return (
    <View style={{ padding: 20 }}>
      <Text>Current Animation State: {state.state}</Text>
      <Text>Current Animation: {state.currentAnimation || 'None'}</Text>
      <Text>Queue Length: {state.queue.length}</Text>
      
      <Button 
        title="Start Animation" 
        onPress={() => {
          dispatch({ type: 'START_ANIMATION' });
        }}
      />
      
      <Button 
        title="Complete Animation" 
        onPress={() => {
          dispatch({ type: 'COMPLETE_ANIMATION' });
        }}
      />
      
      <Button 
        title="Cancel Animation" 
        onPress={() => {
          dispatch({ type: 'CANCEL_ANIMATION' });
        }}
      />
    </View>
  );
}; 