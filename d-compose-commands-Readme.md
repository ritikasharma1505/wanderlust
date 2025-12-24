<<<<<<< HEAD
1️⃣ Update System

```
sudo apt update && sudo apt upgrade -y
```

2️⃣ Install Docker

```
sudo apt install -y docker.io
```

3️⃣ Give Docker Permission to User and Apply changes:

```
sudo usermod -aG docker $USER && newgrp docker
```

Verify:

```
docker --version
```

4️⃣ Install Docker Compose

```
sudo apt install -y docker-compose
```

Verify:
```
docker-compose version
```

5️⃣ Clone the Project

```
git clone <YOUR_GITHUB_REPO_URL>
```

Move into project directory:

```
cd wanderlust/
```

*This folder contains docker-compose.yml*

6️⃣ Environment Configuration

Backend Environment
```
cd backend/.env.docker
```

```
MONGODB_URI=mongodb://mongodb:27017/wanderlust
REDIS_URL=redis://redis:6379
CORS_ORIGIN=http://<EC2_PUBLIC_IP>:5173
```

Frontend Environment (IMPORTANT)

```
cd frontend/.env
```
```
VITE_API_BASE_URL=http://<EC2_PUBLIC_IP>:5000
```
- Why .env and NOT .env.docker for frontend?

- Vite reads environment variables at build time

- Vite automatically loads .env

- Vite does NOT auto-load .env.docker

- Changing frontend env requires rebuilding the image

7️⃣ Docker Compose Build & Run

From the project root (wanderlust/):

```
docker-compose up -d
```

8️⃣ Verify Running Containers

```
docker ps
```


9️⃣ Import Sample Data into MongoDB (Every time, the containers are rebuild, this command is necessary, else wont see the posts)

Sample data file location:

```
cd backend/data/sample_posts.json
```

Import command:

```
docker exec -it mongo mongoimport \
  --db wanderlust \
  --collection posts \
  --file /data/sample_posts.json \
  --jsonArray

```

Verify data:
=======
## Here is the list of commands to be used to Dockerize the Wanderlust MERN app - Docker deployment of Three-tier app

### Update system

```
sudo apt-get update
```

### Intial setup

```
git clone https://github.com/ritikasharma1505/wanderlust.git
git switch devops
```

### Install Docker and set permissions for user

```
sudo apt install docker.io -y
sudo usermod -aG docker ubuntu && newgrp docker
```

```
cd wanderlust/
cd backend/
```

### Create Docker network - Isolated backend and Database container will be able to communicate

```
docker network create wanderlust-net
docker network ls
```

### Run MongoDB container 

```
docker run -d --name mongo --network wanderlust-net -p 27017:27017 mongo:latest
```

### Build and then Run "Backend" Container

```
docker build -t backend .
docker run -d --name backend --network wanderlust-net --env-file .env.docker -p 5000:5000 backend:latest
```

### Verify 

```
docker logs -f backend
```
### To Import sample posts to MongoDB container

```
docker cp ./data/sample_posts.json mongo:/sample_posts.json


docker exec -it mongo mongoimport --db wanderlust --collection posts --file /sample_posts.json --jsonArray

```

### Verify Database
>>>>>>> 32f695233ce36da152212a630b4922897e19e7d8

```
docker exec -it mongo mongosh

use wanderlust
db.posts.countDocuments()
<<<<<<< HEAD
```

🔟 Verify in Browser

Frontend
```
http://<EC2_PUBLIC_IP>:5173
```
Backend API (example)

```
http://<EC2_PUBLIC_IP>:5000
http://<EC2_PUBLIC_IP>:5000/api/posts/
```




#### Cleanup:

- Rebuild container
```
docker-compose up -d --build
```

- Stop and remove containers
```
docker-compose down
```
- Remove all Docker images
```
docker rmi -f $(docker images -q)
```
- Full cleanup (containers, images, networks)
```
docker system prune -a
```
=======
db.posts.find().limit(2).pretty()
```

### Change dir to /frontend

```
cd frontend/
```

### Make updates to .env.docker and .env file - do update the Public IP


### Build and then Run "Frontend" Container

```
docker build -t frontend .
docker run -d --name frontend -p 5173:5173 frontend:latest
```

### Verify

```
docker logs backend
docker logs frontend
```

### Verify Frontend and Backend running on browser

```
http://<public-ip>:5173
http://<public-ip>:5000
http://<pubic-ip>:5000/api/posts
```

---------------------------------------------

### Cleanup:

```
docker kill <container-id>
docker rm <container-id>
docker rmi <image-id>

```

>>>>>>> 32f695233ce36da152212a630b4922897e19e7d8
