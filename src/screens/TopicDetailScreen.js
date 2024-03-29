import React, { useState, useEffect, useRef, useContext } from "react";
import {
  Text,
  View,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Icon } from "react-native-elements";
import { ImageSlider } from "react-native-image-slider-banner";
import { Ionicons } from "react-native-vector-icons";
import TokenContext from "../contexts/TokenContext";
import service from "../helper/axiosService";
import Loading from "../components/Loading";
import Topic from "../components/Topic";
import ImageSlider2 from "../components/ImageSlide2";

export default function TopicDetailScreen({ route, navigation }) {
  const { topicId } = route.params;
  const [isLogin, setIsLogin] = useState(false);
  const { token } = useContext(TokenContext);
  const [saveTopic, setSaveTopic] = useState(false);
  const [loading, setLoading] = useState(false);
  const [UpVoted, setUpVoted] = useState(false);
  const [downVoted, setDownVoted] = useState(false);

  const [topic, setTopic] = useState();

  useEffect(() => {
    setLoading(true);
    service
      .get("/topic/" + topicId)
      .then((res) => {
        setTopic(res.data.results);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  }, []);

  return (
    <>
      {loading && <Loading full={true} />}
      <View style={styles.sheetScreen}>
        {topic && (
          <>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingRight: 15,
                paddingLeft: 10,
                paddingTop: 10,
                paddingBottom: 10,
              }}
            >
              <TouchableOpacity>
                <Icon
                  name="chevron-left"
                  type="font-awesome"
                  color="#000"
                  size={24}
                  onPress={() => navigation.navigate("User")}
                />
              </TouchableOpacity>
              <Text
                style={{
                  fontSize: 18,
                  marginLeft: "auto",
                  marginRight: "auto",
                }}
              >
                {" "}
                Bài viết{" "}
              </Text>
            </View>

            {/* Component hiện ở đây */}
            <ScrollView>
              <Topic item={topic} navigation={navigation} />
              {/* <View style={{flexDirection: "row",}}>
                <View style={styles.profileImage}>
                <Image
                    source={{uri: topic.authorAvatar ? topic.authorAvatar : require("./../../assets/cho.jpg")}}
                    style={styles.image}
                    resizeMode="center"
                ></Image>
                </View>
                <View>
                <Text style={styles.Name}>{topic.author}</Text>
                <Text style={styles.Time}>{topic.createdAt}</Text>
                </View>
            </View>
            <Text style={styles.topicName}>{topic.name}</Text>
            <Text style={styles.Decript}>{topic.content}</Text>

            {topic.images.length > 0 && (
                <ImageSlider2
                data={topic.images.map((img) => ({
                  img,
                }))}
                caroselImageContainerStyle={styles.caroselImageContainerStyle}
                activeIndicatorStyle={styles.activeIndicatorStyle}
                indicatorContainerStyle={styles.indicatorContainerStyle}
                preview={false}
              />
            )}

            <View style={styles.center}>
                <View
                style={{
                    flexDirection: "row",
                    marginTop: 10,
                    marginBottom: 15,
                }}
                >
                <View
                    style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop:10
                    }}
                >
                    <TouchableOpacity>
                    <Ionicons
                        name={UpVoted ? "arrow-up-outline" : "arrow-up-outline"}
                        size={30}
                        color={UpVoted ? "#AACCFF" : "#52575D"}
                        style={{
                        marginRight: 5,
                        }}
                        //onPress={upVote}
                    />
                    </TouchableOpacity>
                    <Text
                    style={{
                        fontSize: 18,
                        color: "#52575D",
                    }}
                    >
                    Vote
                    </Text>
                    <TouchableOpacity>
                    <Ionicons
                        name={downVoted ? "arrow-down-outline" : "arrow-down-outline"}
                        size={30}
                        color={downVoted ? "#AACCFF" : "#52575D"}
                        style={{
                        marginLeft: 5,
                        }}
                        //onPress={downVote}
                    />
                    </TouchableOpacity>
                </View>
                <Ionicons
                    name="chatbubble-outline"
                    size={27}
                    color="#52575D"
                    style={styles.iconStyle}
                ></Ionicons>

                <Ionicons
                    name={saveTopic ? "flag" : "flag-outline"}
                    size={27}
                    color={saveTopic ? "#AACCFF" : "#52575D"}
                    style={styles.iconStyle}
                    //onPress={handleSaveTopicPress}
                ></Ionicons>

                </View>
            </View>
            <View style={styles.Rectangle} />

            <Text>List comment nma tao mệc quá làm sau nhe :D</Text> */}
            </ScrollView>
          </>
        )}
      </View>
    </>
  );
}

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;
const standarWidth = 360;
const standardHeight = 800;

const postHeight = screenHeight * 0.5;
const postWidth = screenWidth;

const styles = StyleSheet.create({
  sheetScreen: {
    backgroundColor: "#fff",
    paddingTop: 10,
    paddingBottom: 20,
    flex: 1,
  },
  body: {
    height: screenHeight * 0.81,
  },

  text: {
    color: "#52575D",
    top: 5,
  },
  image: {
    flex: 1,
    width: undefined,
    height: undefined,
    borderRadius: 100,
  },
  image2: {
    flex: 1,
    width: Dimensions.get("window").width,
    marginTop: 20,
  },
  profileImage: {
    marginTop: 20,
    marginLeft: 15,
    width: 50,
    height: 50,
    overflow: "hidden",
  },
  inputContainer: {
    width: Dimensions.get("window").width - 100,
    marginLeft: 15,
    flex: 1,
  },
  titleStyle: {
    color: "#BABABA",
    marginLeft: "auto",
    paddingLeft: 5,
  },
  inputContainerStyle: {
    borderRadius: 50,
    borderColor: "gray",
    borderWidth: 2,
    borderBottomWidth: 2,
    backgroundColor: "white",
    height: 46,
    marginTop: 20,
  },

  rightIconStyle: {
    paddingRight: 12,
  },
  leftIconStyle: {
    marginRight: 5,
  },
  Rectangle: {
    width: Dimensions.get("window").width,
    height: 2,
    backgroundColor: "#AEB5BC",
  },
  Name: {
    marginLeft: 15,
    marginTop: 22,
    fontSize: 18,
    fontWeight: "bold",
  },
  Time: {
    color: "gray",
    marginLeft: 15,
    marginTop: 2,
  },
  Decript: {
    marginLeft: 20,
    marginBottom: 10,
    fontSize: 16,
    marginRight: 20,
  },

  topicName: {
    marginTop: 10,
    marginLeft: 20,
    fontWeight: "bold",
    fontSize: 20,
    marginRight: 20,
    marginBottom: 5,
  },

  center: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 15,
  },

  img: {
    borderRadius: 50,
    width: 80,
    height: 80,
  },
  iconStyle: {
    marginTop: 10,
    marginLeft: (75 / standarWidth) * screenWidth,
  },
  activeIndicatorStyle: {
    width: 12,
    height: 12,
    borderRadius: 12,
  },
  caroselImageContainerStyle: {
    backgroundColor: "#000",
    height: screenHeight * 0.65,
    // justifyContent: "center",
  },
  indicatorContainerStyle: {
    position: "absolute",
    bottom: -10,
  },
});
