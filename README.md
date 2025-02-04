"# Google_Hackathon_Challenge" 

# Video Analysis backend Project Setup Guide
## Prerequisites
- Python (Ensure Python is installed: https://www.python.org/downloads/)
- pip (Python package manager)

## Cloning the project
1. Open a terminal.

2. Clone the project from git
    - git clone https://github.com/sourcesoftsolution/Google_Hackathon_Challenge
    - cd Google_Hackathon_Challenge/video_analysis_backend 

## Setting Up a Virtual Environment

### Linux/MacOS
1. Open a terminal.
2. Create a virtual environment:

   python3 -m venv venv
   
3. Activate the virtual environment:

   source venv/bin/activate
   

### Windows
1. Open Command Prompt or PowerShell.
2. Create a virtual environment:

   python -m venv venv
   
3. Activate the virtual environment:
   - Command Prompt:
     cmd
     venv\Scripts\activate
     
   - PowerShell:
     powershell
     venv\Scripts\Activate.ps1
     

## Installing Dependencies
Once the virtual environment is activated, install the required dependencies:
pip install -r requirements.txt


## Running the Application
First add the google credentials in the credentails json file and the client secret details in the client secret json file
After that add the smtp mail details and gemini api key in the env file
After installing dependencies, run the application using:
python app.py


## Deactivating the Virtual Environment
Once you are done, you can deactivate the virtual environment by running:
deactivate


# Video Analysis frontend Project Setup Guide
## Prerequisites
- Node (Ensure Node is installed(version 18.18 or higher): https://nodejs.org/en/download )
- React(Vite)
- npm (Node package manager)

## Cloning the project

1. Open a terminal.

2. Clone the project from git
    - git clone https://github.com/sourcesoftsolution/Google_Hackathon_Challenge
    - cd Google_Hackathon_Challenge/video_analysis_frontend    

## Installing Dependencies
1. Open the terminal 
    - npm i 


## Running the Application
1. In the same terminal 
    - npm run dev
