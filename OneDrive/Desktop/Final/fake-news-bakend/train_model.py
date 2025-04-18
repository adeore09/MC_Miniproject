# train_model.py

import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report
import joblib

# 1. Load both files
true_df = pd.read_csv("True.csv")
fake_df = pd.read_csv("Fake.csv")

# 2. Add labels
true_df["label"] = "REAL"
fake_df["label"] = "FAKE"

# 3. Combine them
df = pd.concat([true_df, fake_df]).sample(frac=1).reset_index(drop=True)

# 4. Use only the "text" column (combine title + text if needed)
df["content"] = df["title"] + " " + df["text"]

X = df["content"]
y = df["label"]

# 5. Train-test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 6. Build model pipeline
model = Pipeline([
    ('tfidf', TfidfVectorizer(stop_words='english')),
    ('clf', LogisticRegression())
])

# 7. Train model
model.fit(X_train, y_train)

# 8. Evaluate model
print(classification_report(y_test, model.predict(X_test)))

# 9. Save model
joblib.dump(model, 'fake_news_model.pkl')
