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

```
docker exec -it mongo mongosh

use wanderlust
db.posts.countDocuments()
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