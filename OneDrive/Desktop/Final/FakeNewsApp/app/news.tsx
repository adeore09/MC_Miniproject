import { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  Linking, 
  TouchableOpacity, 
  Image, 
  SafeAreaView,
  TextInput,
  ScrollView,
  RefreshControl,
  Button
} from "react-native";
import * as FileSystem from 'expo-file-system';

const API_KEY = "pub_80777b791154fc96240396d649f7cad247d54";
const LOCAL_JSON_PATH = FileSystem.documentDirectory + 'news.json';

// Default user image
const USER_IMAGE = "https://i.pravatar.cc/100";

// Sample categories for the filter buttons
const categories = [
  { id: '1', name: 'All' },
  { id: '2', name: 'Politics' },
  { id: '3', name: 'Science' },
  { id: '4', name: 'Entertainment' },
];

// Sample featured news for the breaking news section
const featuredNews = {
  image: "https://picsum.photos/800/400",
  source: "New Straits Times",
  sourceIcon: "NST",
  title: "MTUC: Revise Employment Act to mandate wage increases for private sector",
};

export default function NewsScreen() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Save data to local JSON file
  const saveNewsToFile = async (newsData) => {
    try {
      await FileSystem.writeAsStringAsync(
        LOCAL_JSON_PATH,
        JSON.stringify(newsData)
      );
      console.log("News data saved to local JSON file");
    } catch (error) {
      console.error("Failed to save news data to file:", error);
    }
  };

  // Load data from local JSON file
  const loadNewsFromFile = async () => {
    try {
      const fileInfo = await FileSystem.getInfoAsync(LOCAL_JSON_PATH);
      
      if (fileInfo.exists) {
        const data = await FileSystem.readAsStringAsync(LOCAL_JSON_PATH);
        const parsedData = JSON.parse(data);
        setArticles(parsedData || []);
        console.log("Loaded news from local file");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to load local news data:", error);
      return false;
    }
  };

  const fetchNews = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://newsdata.io/api/1/news?apikey=${API_KEY}&country=in&language=en,hi`
      );
      const json = await res.json();
      console.log("Fetched news from API");
      
      if (json.results && json.results.length > 0) {
        // Add a 'Top' flag to first few articles to match the sample UI
        const enhancedResults = json.results.map((article, index) => ({
          ...article,
          isTop: index < 5
        }));
        setArticles(enhancedResults);
        // Save the fetched data to local JSON file
        saveNewsToFile(enhancedResults);
      } else {
        // Try to load from local file if API returns no results
        await loadNewsFromFile();
      }
    } catch (error) {
      console.error("Failed to fetch news:", error);
      // Try to load from local file on API error
      await loadNewsFromFile();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    async function loadInitialData() {
      // Try to load from local file first for instant display
      const localDataLoaded = await loadNewsFromFile();
      
      // Then fetch fresh data from API
      if (!localDataLoaded) {
        setLoading(true);
      }
      fetchNews();
    }
    
    loadInitialData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchNews();
  };

  // Helper function to render the source icon
  const renderSourceIcon = (sourceId) => {
    // Extract first letters from source id to create initials
    const initials = (sourceId || "NS")
      .split('-')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
    
    return (
      <View style={styles.sourceIconContainer}>
        <Text style={styles.sourceIconText}>{initials}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#f44336"]}
            tintColor="#f44336"
          />
        }
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Text style={styles.welcomeText}>Welcome</Text>
            <Text style={styles.userName}>John Doe!</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={handleRefresh}
              disabled={refreshing || loading}
            >
              <Text style={styles.refreshButtonText}>↻</Text>
            </TouchableOpacity>
            <Image source={{ uri: USER_IMAGE }} style={styles.userImage} />
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Image 
            source={{ uri: 'https://img.icons8.com/ios/50/000000/search--v1.png' }} 
            style={styles.searchIcon} 
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor="#888"
          />
        </View>

        {/* Breaking News Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Breaking News</Text>
          <TouchableOpacity style={styles.breakingNewsCard}>
            <Image 
              source={{ uri: featuredNews.image }} 
              style={styles.breakingNewsImage} 
            />
            <View style={styles.breakingNewsContent}>
              <View style={styles.sourceRow}>
                {renderSourceIcon(featuredNews.sourceIcon)}
                <Text style={styles.sourceName}>{featuredNews.source}</Text>
              </View>
              <Text style={styles.breakingNewsTitle}>{featuredNews.title}</Text>
            </View>
            <View style={styles.dotContainer}>
              <View style={[styles.dot, styles.activeDot]} />
              <View style={styles.dot} />
              <View style={styles.dot} />
              <View style={styles.dot} />
              <View style={styles.dot} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Trending Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Trending Right Now</Text>
          
          {/* Category Filter */}
          <View style={styles.categoryContainer}>
            {categories.map((category) => (
              <TouchableOpacity 
                key={category.id}
                style={[
                  styles.categoryButton,
                  selectedCategory === category.name && styles.selectedCategoryButton
                ]}
                onPress={() => setSelectedCategory(category.name)}
              >
                <Text 
                  style={[
                    styles.categoryText,
                    selectedCategory === category.name && styles.selectedCategoryText
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* News Articles */}
          {loading && !refreshing ? (
            <ActivityIndicator size="large" color="#f44336" style={styles.loader} />
          ) : (
            <>
              {articles.length === 0 ? (
                <Text style={styles.noArticles}>No articles available at the moment.</Text>
              ) : (
                <View style={styles.articlesList}>
                  {articles.slice(0, 10).map((item, index) => (
                    <TouchableOpacity 
                      key={item.article_id || index.toString()}
                      style={styles.articleCard}
                      onPress={() => Linking.openURL(item.link)}
                    >
                      <Image 
                        source={{ uri: item.image_url || `https://picsum.photos/300/200?random=${index}` }} 
                        style={styles.articleImage} 
                      />
                      <View style={styles.articleContent}>
                        {item.isTop && <Text style={styles.topTag}>Top</Text>}
                        <Text style={styles.articleTitle} numberOfLines={2}>
                          {item.title || "No Title"}
                        </Text>
                        <View style={styles.articleFooter}>
                          {renderSourceIcon(item.source_id)}
                          <Text style={styles.articleSource}>
                            {item.source_id || "News Source"}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </>
          )}
        </View>
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
    marginBottom: 16,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
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
  refreshButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f2f2f2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  refreshButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f44336',
  },
  userImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginVertical: 16,
  },
  searchIcon: {
    width: 20,
    height: 20,
    tintColor: '#888',
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  breakingNewsCard: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  breakingNewsImage: {
    width: '100%',
    height: 180,
  },
  breakingNewsContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  sourceIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f44336',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  sourceIconText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  sourceName: {
    color: '#fff',
    fontSize: 12,
  },
  breakingNewsTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dotContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ccc',
    marginHorizontal: 3,
  },
  activeDot: {
    backgroundColor: '#f44336',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  categoryContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#f2f2f2',
  },
  selectedCategoryButton: {
    backgroundColor: '#f44336',
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
  },
  selectedCategoryText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  articlesList: {
    marginTop: 8,
  },
  articleCard: {
    flexDirection: 'row',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  articleImage: {
    width: 100,
    height: 100,
  },
  articleContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  topTag: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  articleTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  articleFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  articleSource: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
  },
  loader: { 
    marginTop: 20, 
    marginBottom: 20, 
  },
  noArticles: { 
    textAlign: 'center', 
    marginTop: 20, 
    color: '#666' 
  },
});