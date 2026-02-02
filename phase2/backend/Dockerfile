# Python image
FROM python:3.10

# Ye line Docker container ke andar '/app' folder banayegi
# Aapke PC par 'app' folder hona zaroori nahi hai
WORKDIR /app

# Requirements copy aur install
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade -r requirements.txt

# Aapki saari files (main.py, models, routes etc.) container ke '/app' folder me copy hongi
COPY . .

# User setup (Security ke liye)
RUN useradd -m -u 1000 user
USER user
ENV HOME=/home/user \
	PATH=/home/user/.local/bin:$PATH

# Port expose
EXPOSE 7860

# Start command
# Kyunki image me 'main.py' dikh raha hai, ye command sahi chalegi:
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]