import tensorflow as tf
from tensorflow import keras
import os
import traceback

model_path = os.path.join('ml_model', 'autism_model.h5')
print(f"Attempting to load model from {model_path}")

# Define custom objects
class CustomInputLayer(keras.layers.InputLayer):
    def __init__(self, batch_shape=None, **kwargs):
        print(f"CustomInputLayer init: batch_shape={batch_shape}, kwargs={kwargs.keys()}")
        # Convert batch_shape to input_shape if present
        if batch_shape and not kwargs.get('input_shape'):
            if len(batch_shape) > 1:
                kwargs['input_shape'] = batch_shape[1:]
                if batch_shape[0] is not None:
                    kwargs['batch_size'] = batch_shape[0]
        
        if 'batch_shape' in kwargs:
            del kwargs['batch_shape']
        super().__init__(**kwargs)

class DTypePolicy:
    def __init__(self, *args, **kwargs):
        self._name = "float32"
    
    @property
    def name(self):
        return self._name
        
    @property
    def compute_dtype(self):
        return "float32"
        
    @property
    def variable_dtype(self):
        return "float32"
        
    @classmethod
    def from_config(cls, config):
        return cls(**config)
        
    def get_config(self):
        return {"name": "float32"}

try:
    model = keras.models.load_model(model_path, custom_objects={
        'InputLayer': CustomInputLayer,
        'DTypePolicy': DTypePolicy
    })
    print("Model loaded successfully")
except Exception:
    traceback.print_exc()
