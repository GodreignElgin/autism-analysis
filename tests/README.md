# Tests Directory

This directory contains test and debugging scripts for the Autism Detection Platform.

## Files

- `test_prediction.py` - Tests the ML model prediction functionality
- `test_tf.py` - Tests TensorFlow installation and version
- `debug_tf.py` - Debug script for TensorFlow issues
- `debug_load.py` - Debug script for model loading issues
- `verify_fix.py` - Verification script for model fixes
- `reproduce_issue.py` - Script to reproduce specific issues
- `test_load.py` - Tests model loading from backend

## Usage

Run these scripts from the project root:

```bash
python tests/test_prediction.py
python tests/test_tf.py
```

## Note

These are development/debugging scripts. For production testing, consider using a proper testing framework like pytest.

