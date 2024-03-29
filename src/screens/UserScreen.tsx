import React, { useContext, useEffect, useState, useRef } from "react";
import { Platform, TouchableOpacity } from "react-native";
import { Ionicons } from "react-native-vector-icons";
import {
  Feather,
  Octicons,
  MaterialCommunityIcons,
} from "react-native-vector-icons";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  FlatList,
  ActivityIndicator,
  View,
} from "react-native";
import service, { removeHeaderConfig } from "../helper/axiosService";
import Loading from "../components/Loading";
import Modal from "react-native-modal";
import * as SecureStore from "expo-secure-store";
import TokenContext from "../contexts/TokenContext";
import { useFocusEffect } from "@react-navigation/native";
import { Avatar } from "react-native-elements";
import Topic from "../components/Topic";
const Tab = createMaterialTopTabNavigator();

const goToLocation = (id, navigation) => {
  console.log("Navigating");
  navigation.navigate("MapTab", {
    screen: "Map",
    params: {
      id: id,
    },
  });
};

const BottomTab = ({ bookmarks, navigation, savedTopic, username }) => {
  const BookMark = ({ bookmarks, userScreenNavigation }) => {
    return (
      <View style={{ flex: 1, backgroundColor: "#0000" }}>
        <View style={{ flex: 1 }}>
          <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {bookmarks.reverse().map((bookmarks, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.content}
                  onPress={() =>
                    goToLocation(bookmarks.id, userScreenNavigation)
                  }
                >
                  <Image
                    source={{ uri: bookmarks.thumbnail }}
                    style={styles.img}
                    resizeMode="cover" //fix
                  ></Image>
                  <View style={styles.name}>
                    <Text
                      style={{
                        fontSize: 16,
                        flexWrap: "wrap",
                        textAlign: "center",
                      }}
                    >
                      {bookmarks.name}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    );
  };

  const Forums = ({ username }) => {
    const [data, setData] = useState([]);
    useEffect(() => {
      service
        .get("/topics/" + username)
        .then((res) => {
          setData(res.data.results);
        })
        .catch((err) => {
          console.log("Topics failed ", err);
        });
    }, []);

    const renderItem = ({ item, index }) => (
      <Topic item={item} navigation={navigation} data={data} setData={setData} />
    );

    return (
      <View style={{ flex: 1, backgroundColor: "#" }}>
        <View style={{ flex: 1 }}>
          {data.length > 0 && (
            <FlatList
              data={data.reverse()}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderItem}
              onEndReachedThreshold={0.6}
              windowSize={10}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </View>
    );
  };

  const goToTopicDetail = (topic, navigation) => {
    console.log("Navigating");
    navigation.navigate("UserTab", {
      screen: "Topic",
      params: {
        topicId: topic.id,
      },
    });
  };

  const Save = ({ savedTopic, userScreenNavigation, goToTopicDetail }) => {
    return (
      <View style={{ flex: 1, backgroundColor: "#0000" }}>
        <View style={{ flex: 1 }}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {savedTopic.map((topic, index) => {
                if (topic !== null)
                  return (
                    <TouchableOpacity
                      key={index}
                      style={styles.content}
                      onPress={() =>
                        goToTopicDetail(topic, userScreenNavigation)
                      }
                    >
                      <View style={styles.saveTopic}>
                        <Text
                          style={{
                            ...styles.saveTopicContent,
                            fontWeight: "bold",
                            fontSize: 20,
                          }}
                        >
                          {topic.author}
                        </Text>
                        <Text
                          style={{
                            ...styles.saveTopicContent,
                            fontStyle: "italic",
                            fontWeight: "bold",
                          }}
                        >
                          {topic.name}
                        </Text>
                        <Text
                          style={{
                            ...styles.saveTopicContent,
                            fontStyle: "italic",
                          }}
                        >
                          {topic.createdAt}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
              })}
            </View>
          </ScrollView>
        </View>
      </View>
    );
  };

  return (
    <Tab.Navigator
      style={{ marginTop: -450 }}
      screenOptions={({ route }) => ({
        tabBarShowLabel: false,
        tabBarIndicatorStyle: {
          backgroundColor: "black",
          height: 1.5,
        },
        tabBarIcon: ({ focused, color }) => {
          let iconName;
          if (route.name === "BookMark") {
            iconName = focused ? "bookmarks" : "bookmarks";
            color = focused ? "#52575D" : "#AEB5BC";
          } else if (route.name === "Save") {
            iconName = focused ? "flag" : "flag";
            color = focused ? "#52575D" : "#AEB5BC";
          } else {
            iconName = focused ? "chatbox-ellipses" : "chatbox-ellipses";
            color = focused ? "#52575D" : "#AEB5BC";
          }
          return <Ionicons name={iconName} color={color} size={23} />;
        },
      })}
    >
      <Tab.Screen name="BookMark">
        {() => (
          <BookMark bookmarks={bookmarks} userScreenNavigation={navigation} />
        )}
      </Tab.Screen>
      <Tab.Screen name="Forums">
        {() => <Forums username={username} />}
      </Tab.Screen>
      <Tab.Screen name="Save">
        {() => (
          <Save
            savedTopic={savedTopic}
            userScreenNavigation={navigation}
            goToTopicDetail={goToTopicDetail}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

const UserScreen = ({ route, navigation }) => {
  const [fullname, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [bookmarkList, setBookmarkList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savedTopic, setSavedTopic] = useState([]);

  const [isModalVisible, setModalVisible] = useState(false);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const refreshUserInfo = () => {
    setLoading(true);
    service.get("/users/me", {}).then(
      (res) => {
        const bookmarks = res.data.results.bookmarks;
        const savedTopic = res.data.results.savedTopics;
        const user = res.data.results.username;
        setBookmarkList(bookmarks);
        setUsername(res.data.results.username);
        setFullName(res.data.results.fullName);
        setAvatar(res.data.results.avatar);
        setEmail(res.data.results.email);
        setSavedTopic(res.data.results.savedTopics);
        setLoading(false);
      },
      () => {
        setLoading(false);
        console.log("failed to load bookmark list");
      }
    );
  };

  useFocusEffect(
    React.useCallback(() => {
      refreshUserInfo();
    }, [])
  );

  const { token, setToken } = useContext(TokenContext);

  const logOutHandler = () => {
    const removeToken = async () => {
      await SecureStore.deleteItemAsync("token");
      setToken(null);
      removeHeaderConfig("Authorization");
      navigation.navigate("Login");
    };
    removeToken();
  };

  const navigateToEditProfile = () => {
    setModalVisible(false);
    navigation.navigate("EditProfile", {
      userInfo: {
        fullname: fullname,
        username: username,
        email: email,
        avatar: avatar,
      },
    });
  };

  const navigateToSecurity = () => {
    setModalVisible(false);
    navigation.navigate("Security", {
      username: username,
    });
  };

  return (
    <View style={styles.container}>
      {loading && <Loading full={false} />}
      <ScrollView showsVerticalScrollIndicator={true}>
        <View>
          <TouchableOpacity onPress={toggleModal}>
            <Octicons
              name="three-bars"
              size={24}
              style={{
                position: "absolute",
                top:
                  Platform.OS === "ios"
                    ? screenHeight / 20
                    : screenHeight / 30 - 10,
                right: screenWidth / 20 - 10,
                backgroundColor: "transparent",
                padding: 10,
              }}
            />
          </TouchableOpacity>
        </View>

        <Avatar
          containerStyle={{ alignSelf: "center", marginTop: 50 }}
          source={avatar ? { uri: avatar } : require("./../../assets/ava.png")}
          rounded
          size={"large"}
        />
        <View style={styles.info}>
          <Text style={[styles.text, { fontSize: 20, fontWeight: "bold" }]}>
            {fullname}
          </Text>
          <Text
            style={[
              styles.text,
              {
                color: "#AEB5BC",
                fontSize: 14,
                fontStyle: "italic",
                marginBottom: 5,
              },
            ]}
          >
            {username}
          </Text>
        </View>
        <Modal
          onBackdropPress={() => setModalVisible(false)}
          onBackButtonPress={() => setModalVisible(false)}
          isVisible={isModalVisible}
          swipeDirection="down"
          onSwipeComplete={toggleModal}
          animationIn="bounceInUp"
          animationOut="bounceOutDown"
          animationInTiming={600}
          animationOutTiming={300}
          backdropTransitionInTiming={600}
          backdropTransitionOutTiming={300}
          style={styles.modal}
        >
          <View style={styles.modalContent}>
            <View style={styles.center}>
              <View style={styles.barIcon} />
            </View>

            <View style={styles.flexColumn}>
              <View style={styles.editProfile}>
                <TouchableOpacity
                  style={styles.flexEditProfile}
                  onPress={navigateToEditProfile}
                >
                  <View style={{ flexDirection: "row" }}>
                    <Ionicons name="settings-outline" size={30} />
                    <Text
                      style={{
                        fontSize: 24,
                        fontWeight: "bold",
                        paddingHorizontal: 10,
                      }}
                    >
                      Sửa hồ sơ
                    </Text>
                  </View>
                  <Feather
                    name="chevron-right"
                    style={{
                      alignSelf: "flex-end",
                    }}
                    size={30}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.security}>
                <TouchableOpacity
                  style={styles.flexEditProfile}
                  onPress={navigateToSecurity}
                >
                  <View style={{ flexDirection: "row" }}>
                    <MaterialCommunityIcons name="security" size={30} />
                    <Text
                      style={{
                        fontSize: 24,
                        fontWeight: "bold",
                        paddingHorizontal: 10,
                      }}
                    >
                      Bảo mật
                    </Text>
                  </View>
                  <Feather
                    name="chevron-right"
                    style={{
                      alignSelf: "flex-end",
                    }}
                    size={30}
                  />
                </TouchableOpacity>
              </View>

              {username === "admin" && (
                <View style={{ ...styles.security, top: 40 }}>
                  <TouchableOpacity
                    style={styles.flexEditProfile}
                    onPress={() => navigation.navigate("Admin")}
                  >
                    <View style={{ flexDirection: "row" }}>
                      <MaterialCommunityIcons name="account-tie" size={30} />
                      <Text
                        style={{
                          fontSize: 24,
                          fontWeight: "bold",
                          paddingHorizontal: 10,
                        }}
                      >
                        Admin
                      </Text>
                    </View>
                    <Feather
                      name="chevron-right"
                      style={{
                        alignSelf: "flex-end",
                      }}
                      size={30}
                    />
                  </TouchableOpacity>
                </View>
              )}

              <TouchableOpacity style={styles.logOut} onPress={logOutHandler}>
                <Text
                  style={{ fontSize: 26, fontWeight: "bold", color: "red" }}
                >
                  Đăng xuất
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
      <BottomTab
        bookmarks={bookmarkList}
        navigation={navigation}
        savedTopic={savedTopic}
        username={username}
      />
    </View>
  );
};

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;
const standarWidth = 360;
const standardHeight = 800;

const settingsHeight = screenHeight / 3.8;
const settingsWidth = screenWidth / 12;
const paddingTopModalContent = 10;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffff",
  },

  text: {
    // fontFamily: 'Cochin',
    color: "#52575D",
    top: 5,
  },
  image: {
    flex: 1,
    width: undefined,
    height: undefined,
    borderRadius: 100,
  },
  titleBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 16,
  },
  profileImage: {
    marginTop: 50,
    width: 100,
    height: 100,
    overflow: "hidden",
  },
  info: {
    position: "relative",
    alignSelf: "center",
    alignItems: "center",
  },
  content: {
    flexWrap: "wrap",
    margin: 5,
    left: 5,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  img: {
    width: Dimensions.get("window").width / 3 - 13,
    height: Dimensions.get("window").height / 6 - 2,
    backgroundColor: "#0000",
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    justifyContent: "center",
    alignSelf: "center",
    alignItems: "center",
    marginTop: 2,
    borderColor: "black",
    borderWidth: 1,
  },
  name: {
    width: Dimensions.get("window").width / 3 - 13,
    height: 46,
    backgroundColor: "#ffff",
    // marginTop: -4,
    paddingHorizontal: 2,
    paddingVertical: 2,
    alignSelf: "center",
    alignItems: "center",
    borderBottomRightRadius: 10,
    borderBottomLeftRadius: 10,
    borderColor: "black",
    borderWidth: 1,
    flexWrap: "wrap",
    flexDirection: "row",
    flex: 0.3,
    justifyContent: "center",
  },
  saveTopic: {
    height: screenHeight / 5,
    width: screenWidth / 2 - 13,
    borderRadius: 10,
    borderColor: "black",
    borderWidth: 1,
    backgroundColor: "#ffff",
    justifyContent: "center",
    alignItems: "center",
  },
  saveTopicContent: {
    fontSize: 16,
    flexWrap: "wrap",
    textAlign: "center",
  },
  profileImage: {
    marginTop: 50,
    width: 100,
    height: 100,
    overflow: "hidden",
  },
  add: {
    backgroundColor: "#41444B",
    position: "absolute",
    left: 70,
    top: 130,
    width: 20,
    height: 20,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    position: "relative",
    alignSelf: "center",
    alignItems: "center",
  },
  modal: {
    justifyContent: "flex-end",
    margin: 0,
  },
  modalContent: {
    backgroundColor: "#fff",
    paddingTop: paddingTopModalContent,
    paddingHorizontal: settingsWidth,
    borderWidth: 5,
    borderColor: "#000",
    borderTopRightRadius: 35,
    borderTopLeftRadius: 35,
    minHeight: settingsHeight,
    paddingBottom: 20,
    justifyContent: "center",
    alignItems: "center",
  },

  center: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  barIcon: {
    width: 60,
    height: 5,
    backgroundColor: "#bbb",
    borderRadius: 3,
  },
  flexColumn: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    height: settingsHeight - paddingTopModalContent * 2,
  },
  security: {
    top: 30,
    height: "auto",
  },
  flexEditProfile: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  editProfile: {
    top: 20,
    height: "auto",
  },
  logOut: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
  },
});
export default UserScreen;
