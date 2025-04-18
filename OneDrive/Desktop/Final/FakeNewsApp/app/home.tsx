import React from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView,
  Image,
  ScrollView
} from "react-native";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const router = useRouter();

  const logout = async () => {
    await signOut(auth);
    router.replace("/");
  };

  // Current user details (you can get these from auth.currentUser)
  const USER_IMAGE = "https://i.pravatar.cc/100";
  const userName = "John Doe"; // Replace with auth.currentUser?.displayName

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Text style={styles.welcomeText}>Welcome</Text>
            <Text style={styles.userName}>{userName}!</Text>
          </View>
          <TouchableOpacity onPress={logout}>
            <Image source={{ uri: USER_IMAGE }} style={styles.userImage} />
          </TouchableOpacity>
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Image 
            source={{ uri: 'https://picsum.photos/800/400?random=1' }} 
            style={styles.heroImage}
          />
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Detect Fake News</Text>
            <Text style={styles.heroSubtitle}>
              Stay informed with reliable news sources and verify news articles.
            </Text>
          </View>
        </View>

        {/* Features Section */}
        <Text style={styles.sectionTitle}>What would you like to do?</Text>
        
        <View style={styles.featuresContainer}>
          <TouchableOpacity 
            style={styles.featureCard}
            onPress={() => router.push("/detect")}
          >
            <View style={[styles.featureIconContainer, { backgroundColor: '#ff7043' }]}>
              <Text style={styles.featureIcon}>🕵️‍♂️</Text>
            </View>
            <Text style={styles.featureTitle}>Detect Fake News</Text>
            <Text style={styles.featureDescription}>
              Verify news articles by pasting content for analysis
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.featureCard}
            onPress={() => router.push("/news")}
          >
            <View style={[styles.featureIconContainer, { backgroundColor: '#42a5f5' }]}>
              <Text style={styles.featureIcon}>📰</Text>
            </View>
            <Text style={styles.featureTitle}>Browse News</Text>
            <Text style={styles.featureDescription}>
              Explore trending and verified news from trusted sources
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Why Verify News?</Text>
          <Text style={styles.infoText}>
            Misinformation spreads 6 times faster than factual news. 
            Our AI-powered tool helps you identify potentially false information.
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={logout}
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
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
    marginBottom: 24,
  },
  userInfo: {
    flexDirection: 'column',
  },
  welcomeText: {
    fontSize: 14,
    color: '#666',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  userImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  heroSection: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 30,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  heroImage: {
    width: '100%',
    height: 180,
  },
  heroContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  heroTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  heroSubtitle: {
    color: '#fff',
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  featureCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  featureIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIcon: {
    fontSize: 24,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  featureDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
  infoSection: {
    backgroundColor: '#f2f2f2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 30,
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
  logoutButton: {
    backgroundColor: '#f44336',
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});