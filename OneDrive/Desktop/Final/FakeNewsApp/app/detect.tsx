import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ActivityIndicator
} from "react-native";
import { useRouter } from "expo-router";

export default function DetectScreen() {
  const [newsText, setNewsText] = useState("");
  const [newsTitle, setNewsTitle] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<{title: string, text: string, result: string}[]>([]);
  const API_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
  const router = useRouter();

  // User image (typically would come from auth)
  const USER_IMAGE = "https://i.pravatar.cc/100";

  const checkFakeNews = async () => {
    if (!newsText.trim()) {
      Alert.alert("Please enter some news text.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`http://${API_HOST}:8000/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          text: newsText,
          title: newsTitle 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Server error");
      }

      const data = await response.json();
      const prediction = data.prediction;
      setResult(prediction);
      
      // Add to recent searches
      setRecentSearches(prev => [
        { 
          title: newsTitle,
          text: newsText.substring(0, 100) + (newsText.length > 100 ? "..." : ""), 
          result: prediction 
        },
        ...prev.slice(0, 2) // Keep only 3 most recent searches
      ]);
    } catch (error) {
      console.error("Error checking news:", error);
      Alert.alert("Failed to connect to backend", error.message);
    } finally {
      setLoading(false);
    }
  };

  const clearInput = () => {
    setNewsTitle("");
    setNewsText("");
    setResult(null);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView style={styles.container}>
          {/* Header Section */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Image 
                source={{ uri: 'https://img.icons8.com/ios/50/000000/back.png' }} 
                style={styles.backIcon} 
              />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Fake News Detection</Text>
            <Image source={{ uri: USER_IMAGE }} style={styles.userImage} />
          </View>

          {/* Info Card */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>How It Works</Text>
            <Text style={styles.infoText}>
              Our AI analyzes the content, source reliability, and linguistic patterns 
              to determine if news might be fake or legitimate.
            </Text>
          </View>

          {/* Input Section */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Article Title (Optional)</Text>
            <View style={styles.textInputContainer}>
              <TextInput
                style={styles.titleInput}
                placeholder="Enter news title here..."
                placeholderTextColor="#888"
                onChangeText={setNewsTitle}
                value={newsTitle}
              />
              {newsTitle.length > 0 && (
                <TouchableOpacity 
                  style={styles.clearTitleButton} 
                  onPress={() => setNewsTitle("")}
                >
                  <Text style={styles.clearButtonText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

            <Text style={styles.inputLabel}>News Content</Text>
            <View style={styles.textInputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Paste or type news article here..."
                placeholderTextColor="#888"
                multiline
                numberOfLines={6}
                onChangeText={setNewsText}
                value={newsText}
              />
              {newsText.length > 0 && (
                <TouchableOpacity 
                  style={styles.clearButton} 
                  onPress={() => setNewsText("")}
                >
                  <Text style={styles.clearButtonText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={styles.clearAllButton} 
                onPress={clearInput}
              >
                <Text style={styles.clearAllButtonText}>Clear All</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.checkButton, loading && styles.disabledButton]} 
                onPress={checkFakeNews}
                disabled={loading || !newsText.trim()}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.checkButtonText}>Analyze Article</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Result Section */}
          {result && (
            <View style={[
              styles.resultCard, 
              result === "FAKE" ? styles.resultCardFake : styles.resultCardReal
            ]}>
              <View style={styles.resultHeader}>
                <Text style={styles.resultTitle}>Analysis Result</Text>
                <View style={[
                  styles.resultBadge, 
                  result === "FAKE" ? styles.resultBadgeFake : styles.resultBadgeReal
                ]}>
                  <Text style={styles.resultBadgeText}>{result}</Text>
                </View>
              </View>
              
              <Text style={styles.resultDescription}>
                {result === "FAKE" 
                  ? "This article appears to contain misleading or false information. We recommend verifying with other reliable sources."
                  : "This article appears to be from a legitimate source with factual information. However, always cross-reference important news."
                }
              </Text>

              {/* Additional details could be added here */}
            </View>
          )}

          {/* Recent Searches Section */}
          {recentSearches.length > 0 && (
            <View style={styles.recentContainer}>
              <Text style={styles.sectionTitle}>Recent Checks</Text>
              {recentSearches.map((item, index) => (
                <View key={index} style={styles.recentItem}>
                  <View style={styles.recentContent}>
                    {item.title && (
                      <Text style={styles.recentTitle} numberOfLines={1}>
                        {item.title}
                      </Text>
                    )}
                    <Text style={styles.recentText} numberOfLines={1}>
                      {item.text}
                    </Text>
                  </View>
                  <View style={[
                    styles.recentBadge, 
                    item.result === "FAKE" ? styles.recentBadgeFake : styles.recentBadgeReal
                  ]}>
                    <Text style={styles.recentBadgeText}>{item.result}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Tips Section */}
          <View style={styles.tipsContainer}>
            <Text style={styles.sectionTitle}>Tips to Spot Fake News</Text>
            <View style={styles.tipItem}>
              <View style={styles.tipNumberContainer}>
                <Text style={styles.tipNumber}>1</Text>
              </View>
              <Text style={styles.tipText}>Check the source's credibility and reputation</Text>
            </View>
            <View style={styles.tipItem}>
              <View style={styles.tipNumberContainer}>
                <Text style={styles.tipNumber}>2</Text>
              </View>
              <Text style={styles.tipText}>Look for unusual URLs or site names</Text>
            </View>
            <View style={styles.tipItem}>
              <View style={styles.tipNumberContainer}>
                <Text style={styles.tipNumber}>3</Text>
              </View>
              <Text style={styles.tipText}>Verify with other reputable news sources</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: { 
    flex: 1, 
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: '#333',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  userImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  infoCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  textInputContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  titleInput: {
    backgroundColor: '#f2f2f2',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: '#333',
  },
  input: {
    backgroundColor: '#f2f2f2',
    borderRadius: 12,
    padding: 15,
    minHeight: 120,
    textAlignVertical: "top",
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearTitleButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#666',
    fontSize: 12,
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  clearAllButton: {
    flex: 1,
    backgroundColor: '#f2f2f2',
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  clearAllButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkButton: {
    flex: 2,
    backgroundColor: '#f44336',
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  disabledButton: {
    backgroundColor: '#f4433680',
  },
  checkButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  resultCardFake: {
    backgroundColor: '#ffebee', // Light red background
  },
  resultCardReal: {
    backgroundColor: '#e8f5e9', // Light green background
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  resultBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  resultBadgeFake: {
    backgroundColor: '#f44336',
  },
  resultBadgeReal: {
    backgroundColor: '#4caf50',
  },
  resultBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  resultDescription: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  recentContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  recentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    marginBottom: 8,
  },
  recentContent: {
    flex: 1,
    marginRight: 10,
  },
  recentTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#333',
  },
  recentText: {
    fontSize: 12,
    color: '#666',
  },
  recentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  recentBadgeFake: {
    backgroundColor: '#f44336',
  },
  recentBadgeReal: {
    backgroundColor: '#4caf50',
  },
  recentBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  tipsContainer: {
    marginBottom: 30,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipNumberContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f44336',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tipNumber: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
});