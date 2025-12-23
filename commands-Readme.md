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

```
docker exec -it mongo mongosh

use wanderlust
db.posts.countDocuments()
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

