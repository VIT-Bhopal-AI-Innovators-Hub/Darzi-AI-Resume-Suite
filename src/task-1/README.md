# Data Processing & Parsing Prototype

## Overview

This directory contains the initial prototype for the resume parsing engine for the Darzi AI project. The goal of this prototype was to explore methods for extracting structured data from PDF resumes. It includes a Python-based parser and a simple web interface for live testing.

## Live Demo

**You can test the live prototype here:** #Not yet deployed. I will deploy it ASAP

## Key Findings & Discoveries from Week 1

* **Hybrid Parsing is Essential:** A combination of techniques is required. Simple RegEx is effective for contact info, and a rule-based Matcher is reliable for known skills.
* **PDF Layouts:** The text extraction pipeline successfully handles both single and multi-column PDF layouts using the `pdfplumber` library.
* **Generic AI Models are Insufficient for Parsing:** A generic NER model struggles with resume-specific terms. Our parser's role is to provide clean, structured data *to* the AI, not rely on the AI *for* parsing facts.
* **Section-Based Parsing is a Robust Strategy:** Identifying section headers (like "SKILLS" or "EXPERIENCE") is a more reliable way to extract information than trying to create a single, complex rule.

## How to Run Locally

1.  Make sure you have all required libraries:
    ```bash
    pip install -r requirements.txt
    ```
2.  Run the Streamlit app from the `task-1` directory:
    ```bash
    streamlit run app.py
    ```

## Screenshots

![App Interface](path/to/your/screenshot1.png)
![JSON Output](path/to/your/screenshot2.png)