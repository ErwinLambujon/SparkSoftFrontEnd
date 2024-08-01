import React, { useState } from "react";
import { Typography, Box, Grid, TextField, Button, Input } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import axios from "axios";

function App() {
  axios.defaults.baseURL = "http://localhost:8000";
  const [userInput, setUserInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [followUpIndex, setFollowUpIndex] = useState(null);
  const [followUpInput, setFollowUpInput] = useState("");

  const handleFileUpload = async (event) => {
    const uploadedFiles = event.target.files;
    setIsUploading(true);

    const formData = new FormData();
    for (let i = 0; i < uploadedFiles.length; i++) {
      formData.append("files", uploadedFiles[i]);
    }

    try {
      const response = await axios.post("/api/upload_files/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setIsUploading(false);
      alert(response.data.message);
    } catch (error) {
      console.error("Error uploading files:", error);
      setIsUploading(false);
      alert("Error uploading files. Please try again.");
    }
  };

  const handleIconClick = async (event) => {
    event.stopPropagation(); // Prevents the click event from bubbling up
    try {
      const userQuery = userInput.trim();
      if (!userQuery) return;

      const newEntry = { user: userQuery };
      setConversation((prev) => [newEntry, ...prev]);

      const response = await axios.post("/api/ask_ai/", {
        question: userQuery,
        context: conversation,
      });
      console.log("AI Response:", response.data); // Log the response

      const aiEntry = {
        ...newEntry,
        ai: response.data.responses.map((r) => `${r[1]}: ${r[0]}`).join("\n\n"),
      };

      setConversation((prev) => [aiEntry, ...prev.slice(1)]);
      setUserInput("");
    } catch (error) {
      console.error("Error:", error);
      const errorEntry = {
        user: userInput,
        ai: "An error occurred while fetching the response.",
      };
      setConversation((prev) => [errorEntry, ...prev.slice(1)]);
      setUserInput("");
    }
  };

  const handleFollowUpClick = async (index) => {
    try {
      const userQuery = followUpInput.trim();
      if (!userQuery) return;

      const newEntry = { user: userQuery };
      const updatedConversation = [...conversation];
      updatedConversation[index] = {
        ...updatedConversation[index],
        followUp: newEntry,
      };
      setConversation(updatedConversation);

      const response = await axios.post("/api/ask_ai/", {
        question: userQuery,
        context: updatedConversation,
      });
      console.log("AI Response:", response.data); // Log the response

      const aiEntry = {
        ...newEntry,
        ai: response.data.responses.map((r) => `${r[1]}: ${r[0]}`).join("\n\n"),
      };
      updatedConversation[index] = {
        ...updatedConversation[index],
        followUp: aiEntry,
      };
      setConversation(updatedConversation);
      setFollowUpIndex(null);
      setFollowUpInput("");
    } catch (error) {
      console.error("Error:", error);
      const errorEntry = {
        user: followUpInput,
        ai: "An error occurred while fetching the response.",
      };
      const updatedConversation = [...conversation];
      updatedConversation[index] = {
        ...updatedConversation[index],
        followUp: errorEntry,
      };
      setConversation(updatedConversation);
      setFollowUpIndex(null);
      setFollowUpInput("");
    }
  };

  return (
    <div className="App">
      <Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            marginTop: "20px",
            marginBottom: "20px",
          }}
        >
          <Typography
            variant="h3"
            sx={{
              fontFamily: "Lexend Deca",
              color: "#186F65",
            }}
          >
            Ng Khai Development Corporation
          </Typography>
        </Box>
        <Box
          sx={{
            margin: "20px",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Input
            type="file"
            multiple
            onChange={handleFileUpload}
            style={{ display: "none" }}
            id="raised-button-file"
          />
          <label htmlFor="raised-button-file">
            <Button
              variant="contained"
              component="span"
              startIcon={<CloudUploadIcon />}
              disabled={isUploading}
            >
              {isUploading ? "Uploading..." : "Upload Files"}
            </Button>
          </label>
        </Box>
        <Box
          sx={{
            margin: "20px",
          }}
        >
          <Grid container spacing={0} style={{ height: "100%" }}>
            <Grid
              item
              xs={5}
              style={{ backgroundColor: "#f0f0f0", padding: "20px" }}
            >
              <TextField
                fullWidth
                id="fullWidth"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
              />
            </Grid>
            <Grid
              item
              xs={2}
              style={{ backgroundColor: "#186F65", width: "1px" }}
            >
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height="100%"
                onClick={handleIconClick}
                style={{ cursor: "pointer" }}
              >
                <ArrowForwardIcon sx={{ color: "white", fontSize: 50 }} />
              </Box>
            </Grid>
            <Grid
              item
              xs={5}
              style={{ backgroundColor: "#e0e0e0", padding: "20px" }}
            >
              <Typography variant="h6">
                {conversation.map((entry, index) => (
                  <div key={index}>
                    <div>
                      <strong>User:</strong> {entry.user}
                    </div>
                    {entry.ai && (
                      <>
                        <div>
                          <strong>AI:</strong> {entry.ai}
                        </div>
                        <div>
                          <TextField
                            id="outlined-basic"
                            label="ASK MORE"
                            variant="standard"
                            value={index === followUpIndex ? followUpInput : ""}
                            onChange={(e) => {
                              setFollowUpIndex(index);
                              setFollowUpInput(e.target.value);
                            }}
                          />
                          <Button
                            onClick={() => handleFollowUpClick(index)}
                            startIcon={<ArrowForwardIcon />}
                          >
                            ASK MORE
                          </Button>
                        </div>
                      </>
                    )}
                    {entry.followUp && (
                      <>
                        <div>
                          <strong>User:</strong> {entry.followUp.user}
                        </div>
                        <div>
                          <strong>AI:</strong> {entry.followUp.ai}
                        </div>
                      </>
                    )}
                    <hr />
                  </div>
                ))}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </div>
  );
}

export default App;
