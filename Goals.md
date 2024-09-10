## Project Optimization Information

### Data Collection
- **Number of Samples**: 100,000 samples
- **Devices**: Data should be collected from at least 10 devices, ideally up to 20 devices.
- **Data Balance**: Ensure the data is balanced to avoid bias in the model. Gather metrics about data balance.
- **Data Type**: String data in 1D format.

### Feature Sets and Vectors
- **Exact Feature Sets**: To be determined.
- **Feature Vector**: To be determined.

### Machine Learning and AI Approaches
1. **1D to 2D Conversion**: 
   - Convert 1D data to images (2D) and use CNN 2D for processing.
2. **1D CNN**: 
   - Directly apply 1D CNN on string data.
3. **Ensemble Learning**:
   - Utilize ensemble learning techniques such as XGBoost and Random Forest Classifier.
   - Implement both soft and hard voting methods.

### Model Evaluation Metrics
- **Confusion Matrix**: Analyze false positives and false negatives.
- **F1 Score**: Evaluate precision and recall.
- **Additional Metrics**: Precision and recall should also be considered.

### Dataset Split
- **Training Set**: 70%
- **Validation Set**: 10%
- **Test Set**: 20%

### Binary Classification
- **Classification Type**: Binary classification using ensemble learning with both soft and hard voting.
- **Approach**: 1 vs all and 1 vs SVM.

### Future Exploration
- If the initial architectures do not perform well, consider using Siamese Neural Networks (SNN) for training models on this type of data.