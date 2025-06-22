FROM python:3.10-slim
WORKDIR /app
COPY app /app
RUN pip install -r /app/requirements.txt
CMD ["python", "main.py"]
