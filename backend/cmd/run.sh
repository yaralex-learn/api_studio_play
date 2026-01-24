#!/bin/bash

export ENV=development
source venv/bin/activate
uvicorn app.main:app --reload
