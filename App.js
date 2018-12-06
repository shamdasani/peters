// once we get student id, greet the user and get data from spreadsheet

import React from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  StatusBar,
  TextInput,
  WebView,
  Linking,
  TouchableOpacity,
  KeyboardAvoidingView,
  AsyncStorage,
  AlertIOS
} from "react-native";
import { StackNavigator, Button } from "react-navigation";
import styled from "styled-components/native";
import {
  Ionicons,
  MaterialIcons,
  Entypo,
  FontAwesome
} from "@expo/vector-icons";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

class HomeScreen extends React.Component {
  constructor(props) {
    super(props);
    this.updateData = this.updateData.bind(this);

    this.state = { today: "", email: "", data: null, id: "" };
  }

  async componentDidMount() {
    let id = await AsyncStorage.getItem("id");
    let personal = await AsyncStorage.getItem("data");
    this.setState({
      email: id,
      data: JSON.parse(personal)
    });
    if (id === null) {
      AlertIOS.prompt(
        "Please enter your Prep student ID number:",
        null,
        text => {
          this.setState({
            id: text
          });
          this.updateStorage();
          this.askForData();
        }
      );
    }
  }

  async askForData() {
    if (this.state.data === null) {
      var url =
        "https://script.google.com/macros/s/AKfycbybwKdb5a3FqqFj861AgOBqgTeVf6opcuKJOJXUHx7eu5Y4dYow/exec";
      var data = this.state.id;

      fetch(url, {
        method: "POST", // or 'PUT'
        body: data, // data can be `string` or {object}!
        headers: {
          "Content-Type": "application/json"
        }
      })
        .then(res => res.json())
        .then(response => {
          this.setState({
            data: response
          });
          this.updateStorage();
        })
        .catch(error =>
          alert("An error has occured. Try switching to cellular data.")
        );
    }
  }

  async updateStorage() {
    let storedValue = await AsyncStorage.setItem("id", this.state.id);
    let storedDataValue = await AsyncStorage.setItem(
      "data",
      JSON.stringify(this.state.data)
    );
  }

  updateData(result) {
    const data = result.data;
    this.setState({ data: data });
  }

  formatDate(date) {
    let dateString = date.toISOString().slice(0, 10);
    return dateString;
  }

  getAnnouncementsURL() {
    let date = new Date();
    return (
      "http://intranet.spprep.org/calendar/announcements/" +
      this.formatDate(date) +
      ".html"
    );
  }

  getHomeScreenDate() {
    var currentDate = new Date();
    var day = currentDate.getDate();
    var month = currentDate.getMonth() + 1;
    var year = currentDate.getFullYear();
    return month + "/" + day + "/" + year;
  }

  getCalendarEventsURL() {
    let calendarURL =
      "https://www.googleapis.com/calendar/v3/calendars/144grand@gmail.com/events?key=AIzaSyCwrVw53CGqcgOrfX0Sc-0bbsrBMCJKg_o";
    let today = new Date();
    let date = this.formatDate(today);

    return (
      calendarURL +
      "&timeMin=" +
      date +
      "T10:00:00-07:00&timeMax=" +
      date +
      "T10:00:00-09:00"
    );
  }

  fetchCalendarEvents() {
    return fetch(this.getCalendarEventsURL())
      .then(response => response.json())
      .then(responseJson => {
        var today = responseJson.items[0].summary;
        today = today.toString();
        today = this.setState({ today });
      });
  }

  clear() {
    AsyncStorage.clear();
  }

  render() {
    const { navigate } = this.props.navigation;
    const announcementsURL = this.getAnnouncementsURL();
    const events = this.fetchCalendarEvents();
    const date = this.getHomeScreenDate();

    var personalized;
    if (this.state.data) {
      let user = this.state.data.email.match(/[a-zA-Z]+/g)[0].slice(0, -1);
      personalized =
        "Hello Mr. " + user.charAt(0).toUpperCase() + user.slice(1);
    } else {
      personalized = date;
    }

    var scheduletab;
    if (this.state.data) {
      scheduletab = (
        <Tab
          style={styles.inline}
          g="#b23333"
          onPress={() =>
            navigate("Web", {
              title: "Schedule",
              url:
                "http://intranet.spprep.org/images/pdf/Student_Schedules/Current_Student_Schedules/" +
                this.state.data.pdf
            })
          }
        >
          {/* <MaterialIcons name="schedule" size={32} color="white" /> */}
          My Schedule
        </Tab>
      );
    } else {
      scheduletab = <View />;
    }
    return (
      <View>
        <StatusBar barStyle="dark-content" />
        <ScrollView>
          <Image
            style={styles.image}
            source={require("./peters.png")}
            resizeMode="stretch"
          />
          <LetterDay>
            {personalized}
            {"\n"}
            {/* {date} {"\n"} */}
            {this.state.today}
          </LetterDay>
          {scheduletab}
          {/* <Tab
            style={styles.inline}
            g="#b23333"
            onPress={() => navigate("Homework")}
          >
            Homework
          </Tab> */}
          <Tab
            g="#992c2c"
            onPress={() =>
              navigate("Web", {
                title: "PowerSchool",
                url: "https://spprep.powerschool.com"
              })
            }
          >
            {/* <Text style={styles.p}>P</Text> */}
            PowerSchool
          </Tab>
          <Tab
            g="#8c2525"
            onPress={() => {
              Linking.openURL("https://spprep.schoology.com");
            }}
          >
            Schoology
          </Tab>
          <Tab
            g="#7a2121"
            onPress={() => {
              Linking.openURL("https://spprep.instructure.com/");
            }}
          >
            Canvas
          </Tab>
          <Tab
            g="#681c1c"
            onPress={() =>
              navigate("Web", {
                title: "Prep Calendar",
                url:
                  "https://calendar.google.com/calendar/embed?title=Saint+Peter%27s+Prep+Calendar&height=600&wkst=1&bgcolor=%23FFFFFF&src=144grand@gmail.com&color=%23A32929&src=j2u1oqdhka8e0v1o4p5t6avcjk@group.calendar.google.com&color=%236E6E41&src=j62aodeshq58d2u3la7pi9b8os@group.calendar.google.com&color=%230D7813&src=4pjksvuk9if0th7fa6tp1ainoo@group.calendar.google.com&color=%2329527A&ctz=America/New_York"
              })
            }
          >
            School Calendar
          </Tab>
          <Tab
            g="#601818"
            onPress={() =>
              navigate("Web", {
                title: "Announcements",
                url: announcementsURL
              })
            }
          >
            Announcements
          </Tab>
          <Tab
            g="#591717"
            onPress={() =>
              navigate("Web", {
                title: "Bell Schedule",
                url:
                  "https://drive.google.com/file/d/1AkcQKxa17zvSo8p3xCbca7eM2bmVk2Qt/view"
              })
            }
          >
            Bell Schedule
          </Tab>
          <Tab
            g="#4f1717"
            onPress={() => {
              navigate("Web", {
                title: "Club Directory",
                url: "https://www.sppstudentcouncil.org/clubs"
              });
            }}
          >
            Club Directory
          </Tab>
          {/* <Tab g="#4f1717" onPress={this.clear()}>
            Reset Account
          </Tab> */}
        </ScrollView>
      </View>
    );
  }
}

class WebScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const { state } = navigation;

    return {
      title: `${
        state.params && state.params.title ? state.params.title : "Web"
      }`
    };
  };

  render() {
    const { state } = this.props.navigation;

    return (
      <WebView source={{ uri: state.params.url }} style={{ marginTop: 20 }} />
    );
  }
}

class HomeworkScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      headerRight: (
        <FontAwesome
          style={{ paddingRight: 15 }}
          name="plus"
          size={25}
          color="#007AFF"
          onPress={navigation.getParam("addClass")}
        />
      )
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      tasks: [
        {
          subject: "Math",
          value: ""
        },
        {
          subject: "Science",
          value: ""
        },
        {
          subject: "English",
          value: ""
        }
      ]
    };
  }

  componentDidMount() {
    this.props.navigation.setParams({ addClass: this._addClass });
    this.fetchTasks();
  }

  _addClass = () => {
    alert("updated");
    let task = {
      subject: "New Class",
      value: ""
    };
    this.setState(prevState => ({
      tasks: [...prevState.tasks, task]
    }));
  };

  async fetchTasks() {
    let tasks = await AsyncStorage.getItem("tasks");
    tasks = JSON.parse(tasks);
    this.setState({ tasks: tasks });
  }

  async updateState(type, value, i) {
    if (type === "subject") {
      this.setState(prevState => {
        const tasks = [...prevState.tasks];
        tasks[i].subject = value;
        return { tasks: tasks };
      });
      storedValue = await AsyncStorage.setItem(
        "tasks",
        JSON.stringify(this.state.tasks)
      );
    } else if ((type = "value")) {
      this.setState(prevState => {
        const tasks = [...prevState.tasks];
        tasks[i].value = value;
        return { tasks: tasks };
      });
      storedValue = await AsyncStorage.setItem(
        "tasks",
        JSON.stringify(this.state.tasks)
      );
    }
  }

  render() {
    var work;
    let tasks = this.state.tasks;
    if (this.state.tasks[0]) {
      work = tasks.map((task, i) => (
        <View key={i} style={{ paddingBottom: 5 }}>
          <TextInput
            style={styles.class}
            value={task.subject}
            onChangeText={value => this.updateState("subject", value, i)}
          />
          <TextInput
            multiline={true}
            style={{
              height: 75,
              borderWidth: 1
            }}
            placeholder="Homework"
            onChangeText={value => this.updateState("value", value, i)}
            value={task.value}
            style={styles.task}
          />
        </View>
      ));
    } else {
      work = <View />;
    }

    return (
      <KeyboardAwareScrollView style={styles.homework}>
        {work}
      </KeyboardAwareScrollView>
    );
  }
}

class StudentIDScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = { id: "" };
  }

  render() {
    const { navigate } = this.props.navigation;

    return (
      <IdScreen>
        <StudentIDInput
          keyboardType="numeric"
          placeholder="Enter Student ID..."
          onChangeText={id => this.setState({ id })}
          value={this.state.id}
        />
        <TouchableOpacity
          onPress={() => {
            navigate("Web", {
              title: "Schedule",
              url:
                "http://intranet.spprep.org/images/pdf/Student_Schedules/Current_Student_Schedules/" +
                this.state.id +
                ".pdf"
            });
          }}
        >
          <GetSchedule>Get Schedule</GetSchedule>
        </TouchableOpacity>
      </IdScreen>
    );
  }
}

const Navigation = StackNavigator({
  Home: {
    screen: HomeScreen,
    navigationOptions: {
      title: "Home",
      header: null
    }
  },
  Web: {
    screen: WebScreen
  },
  Homework: {
    screen: HomeworkScreen,
    navigationOptions: {
      title: "Homework"
    }
  },
  StudentID: {
    screen: StudentIDScreen,
    navigationOptions: {
      title: "Enter Student ID"
    }
  }
});
const styles = StyleSheet.create({
  image: {
    height: 70,
    width: 70,
    borderWidth: 1,
    borderRadius: 35,
    marginTop: 40,
    marginLeft: 20,
    marginBottom: 20
  },
  inline: {
    flexDirection: "row",
    flexWrap: "wrap"
  },
  p: {
    fontWeight: "bold",
    fontSize: 24
  },
  homework: {
    padding: 0
  },
  task: {
    padding: 10,
    fontSize: 20,
    alignSelf: "stretch",
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: "#D3D3D3"
  },
  class: {
    padding: 10,
    fontSize: 24,
    letterSpacing: -1,
    fontWeight: "bold"
  }
});

const Tab = styled.Text`
  background: ${props => props.g};
  padding: 30px;
  width: 100%;
  color: #fff;
  font-size: 24px;
`;

const LetterDay = styled.Text`
  font-size: 25px;
  color: #555555;
  text-align: right;
  position: absolute;
  top: 0;
  right: 0;
  padding: 20px;
  padding-top: 45px;
`;
const StudentIDInput = styled.TextInput`
  font-size: 30px;
  color: #fff;
  text-align: center;
`;
const IdScreen = styled.View`
  background: #8b1717;
  padding-top: 100px;
  padding-left: 40px;
  padding-right: 40px;
  height: 100%;
`;

const GetSchedule = styled.Text`
  margin-top: 10%;
  padding: 20px;
  text-align: center;
  background: #800000;
  font-size: 30px;
  color: #fff;
`;
export default Navigation;

// http://blog.thebakery.io/todomvc-with-react-native-and-redux/
