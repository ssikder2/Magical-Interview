# Magical LLM Challenge

## What I Built

I've created a **fully autonomous AI agent** that can intelligently fill out any web form using an agentic loop approach. The agent perceives the form structure, makes strategic decisions using AI, and executes actions efficiently.

### Key Features

- **Intelligent Form Analysis**: Uses AI to understand form structure (sections, fields, types)
- **Strategic Decision Making**: AI decides when to explore sections vs. fill fields vs. submit
- **Efficient Execution**: Fills multiple fields in batches to minimize API calls
- **Robust Agentic Loop**: Perceive → Decide → Act → Repeat until completion
- **Job Management**: REST API endpoints for creating, monitoring, and scheduling form-filling jobs
- **Automated Scheduling**: Runs forms every 5 minutes with rotating test data sets

### Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Perception     │    │   Decision      │    │   Execution     │
│     Module      │───▶│     Module      │───▶│     Module      │
│                 │    │                 │    │                 │
│ • Analyzes DOM  │    │ • AI-powered    │    │ • Playwright    │
│ • Finds fields  │    │ • Strategic     │    │ • Clicks, fills │
│ • Tracks state  │    │ • Phase-based   │    │ • Submits forms │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### How It Works

1. **Perception**: Scans the page to find form sections, fields, and current state
2. **Decision**: AI analyzes the situation and chooses the next strategic phase:
   - `EXPLORE_SECTIONS`: Open a new section to discover fields
   - `FILL_VISIBLE_FIELDS`: Fill all currently visible fields efficiently
   - `SUBMIT`: Submit when form is complete
3. **Execution**: Uses Playwright to perform actions (click, fill, submit)
4. **Repeat**: Continues until form is fully completed

## How to Test

### 1. Start the Services
```bash
npm run dev
```

### 2. Watch the Magic Happen
- The scheduler automatically creates form-filling jobs every 5 minutes
- The agent will automatically open your browser
- Navigate to the form and start filling it out
- Watch it intelligently explore sections and fill fields
- See it submit the form when complete

### 3. Manual Job Creation (Optional)
If you want to test with custom data or specific scenarios:
```bash
curl -X POST http://localhost:3000/api/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://magical-medical-form.netlify.app/",
    "formData": {
      "firstName": "Jane",
      "lastName": "Smith", 
      "dateOfBirth": "1985-05-15",
      "medicalId": "67890",
      "gender": "Female",
      "bloodType": "A+",
      "allergies": "Peanuts",
      "medications": "Vitamin D",
      "emergencyContact": "Mike Smith",
      "emergencyPhone": "555-5678"
    }
  }'
```

### 4. Monitor Job Progress (Optional)
```bash
curl http://localhost:3000/api/jobs
```

### 5. Check Job Results (Optional)
```bash
curl http://localhost:3000/api/jobs/[JOB_ID]
```

**Note**: Jobs are created automatically by the scheduler service every 5 minutes, but you can also manually create jobs via the API for testing specific scenarios.

## What Makes This Special

- **Form-Agnostic**: Works with any web form, not just the medical form
- **AI-Powered**: Makes intelligent decisions about form-filling strategy
- **Production-Ready**: Includes error handling, rate limiting, and job management
- **Scalable**: Can handle multiple concurrent form-filling jobs
- **Observable**: Full logging and job status tracking

## Project Structure

```
src/
├── core/agent/           # Main AI agent implementation
│   ├── MedicalFormAgent.ts    # Orchestrates the agentic loop
│   └── modules/               # Specialized modules
│       ├── PerceptionModule.ts # Analyzes form state
│       ├── DecisionModule.ts   # AI-powered decision making
│       └── ExecutionModule.ts  # Executes Playwright actions
├── services/              # Background services
│   ├── JobProcessor.ts    # Processes pending jobs
│   └── SchedulerService.ts # Creates scheduled jobs
└── routes/                # REST API endpoints
    └── formRoutes.ts      # Job management API
```

---

## Overview

Welcome! We're excited to see you're interested in joining our team.

Today, you'll be working on a scoped down version of our autonomous automation platform.

Below you will find all the necessary information to complete the task. If you have any questions, please reach out to your contact at Magical.

### Task

You are tasked with creating an AI agent that fills out web forms, create a working agentic loop
that will fill out an example healthcare workflow.

Here is the SOP (standard operating procedure) for the workflow:
1. Navigate to https://magical-medical-form.netlify.app/
2. Fill out the form with:
   1. First Name: John
   2. Last Name: Doe
   3. Date of birth: 1990-01-01
   4. Medical ID: 91927885
3. Click 'Submit'

### Bonus Points

In this challenge there are a few bonus points, that'll help supercharge the agent.

1. Complete the 2nd and 3rd sections of the form. You will need to:
   1. Fill out dropdowns
   2. Scroll to, and open the appropriate sections
2. Add the ability to run the workflow via an API call
3. Add the ability to pass in variables for the prompt
   1. Think a dynamic "First Name" and "Last Name," you can hardcode an example
4. Make it so that this workflow can be run automatically on a schedule, every 5 minutes in this
   case.
5. Think of something else our agent needs and implement it!

### What's provided

We've provided you with a basic setup that will set you up for success. You're given:

1. An initiated playwright session
2. A model setup, with access to the Vercel AI SDK (what we use)
   1. NOTE: You will need to provide your own Gemini API key via the `GOOGLE_GENERATIVE_AI_API_KEY` environment variable.
   2. You can get a free API key from the [Google AI Studio](https://aistudio.google.com/apikey).

## Setup

### System Requirements

- Node.js 20+


### Setup

Clone the repository

Install dependencies
```bash
npm install
```

Install playwright
```bash
npx playwright install
```

Create a `.env` file and add your Gemini API key

```bash
GOOGLE_GENERATIVE_AI_API_KEY=your_google_key
```

### Running the script

```bash
npm run dev
```


