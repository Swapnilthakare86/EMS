pipeline {
    agent any

    options {
        timeout(time: 40, unit: 'MINUTES')
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '5'))
    }

    environment {
        DOCKER_USER    = "swapnilthakare86"
        EC2_HOST       = "13.205.135.58"
        DB_HOST        = "emp-data.cpg6iaa4wcf8.ap-south-1.rds.amazonaws.com"
        DB_NAME        = "emp_data"
        DB_USER        = "admin"
        MYSQL_PASSWORD = credentials('mysql-password')
    }

    stages {

        // ── STAGE 1: Checkout ─────────────────────────────────────────────────
        stage('Checkout') {
            steps {
                checkout scm
                echo " Code checked out successfully"
            }
        }

        // ── STAGE 2: Build Backend Image ──────────────────────────────────────
        stage('Build Backend') {
            steps {
                timeout(time: 10, unit: 'MINUTES') {
                    sh '''
                        echo "→ Building Backend Docker image..."
                        docker build -t $DOCKER_USER/ems-backend:latest ./Backend
                        echo " Backend image built"
                    '''
                }
            }
        }

        // ── STAGE 3: Build Frontend Image ─────────────────────────────────────
        stage('Build Frontend') {
            steps {
                timeout(time: 15, unit: 'MINUTES') {
                    sh '''
                        echo "→ Building Frontend Docker image..."
                        docker build --no-cache -t $DOCKER_USER/ems-frontend:latest ./Frontend
                        echo " Frontend image built"
                    '''
                }
            }
        }

        // ── STAGE 4: Build Reports Service Image ──────────────────────────────
        stage('Build Reports Service') {
            steps {
                timeout(time: 10, unit: 'MINUTES') {
                    sh '''
                        echo "→ Building Reports Service Docker image..."
                        docker build -t $DOCKER_USER/ems-reports:latest ./reports-service
                        echo " Reports image built"
                    '''
                }
            }
        }

        // ── STAGE 5: Push All Images to DockerHub ─────────────────────────────
        stage('Push Docker Images') {
            steps {
                timeout(time: 10, unit: 'MINUTES') {
                    withCredentials([usernamePassword(
                        credentialsId: 'dockerhub-creds',
                        usernameVariable: 'DOCKER_USERNAME',
                        passwordVariable: 'DOCKER_PASSWORD'
                    )]) {
                        sh '''
                            echo "→ Logging into DockerHub..."
                            echo $DOCKER_PASSWORD | docker login -u $DOCKER_USERNAME --password-stdin

                            echo "→ Pushing images..."
                            docker push $DOCKER_USER/ems-backend:latest
                            docker push $DOCKER_USER/ems-frontend:latest
                            docker push $DOCKER_USER/ems-reports:latest

                            echo "All images pushed to DockerHub"
                        '''
                    }
                }
            }
        }

        // ── STAGE 6: Deploy on EC2 ────────────────────────────────────────────
        stage('Deploy on EC2') {
            steps {
                timeout(time: 10, unit: 'MINUTES') {
                    sshagent(['ec2-ssh-key']) {
                        sh '''
                            echo "→ Deploying on EC2..."
                            ssh -o StrictHostKeyChecking=no ubuntu@$EC2_HOST "

                                echo '→ Pulling latest images...'
                                docker pull $DOCKER_USER/ems-backend:latest
                                docker pull $DOCKER_USER/ems-frontend:latest
                                docker pull $DOCKER_USER/ems-reports:latest

                                echo '→ Stopping old containers...'
                                docker stop ems-backend  2>/dev/null || true
                                docker stop ems-frontend 2>/dev/null || true
                                docker stop ems-reports  2>/dev/null || true

                                echo '→ Removing old containers...'
                                docker rm ems-backend  2>/dev/null || true
                                docker rm ems-frontend 2>/dev/null || true
                                docker rm ems-reports  2>/dev/null || true

                                echo '→ Starting Backend...'
                                docker run -d \
                                    --name ems-backend \
                                    --restart unless-stopped \
                                    -p 8081:8080 \
                                    -e SPRING_DATASOURCE_URL=jdbc:mysql://$DB_HOST:3306/$DB_NAME \
                                    -e SPRING_DATASOURCE_USERNAME=$DB_USER \
                                    -e SPRING_DATASOURCE_PASSWORD=$MYSQL_PASSWORD \
                                    $DOCKER_USER/ems-backend:latest

                                echo '→ Starting Frontend...'
                                docker run -d \
                                    --name ems-frontend \
                                    --restart unless-stopped \
                                    -p 80:80 \
                                    $DOCKER_USER/ems-frontend:latest

                                echo '→ Starting Reports Service...'
                                docker run -d \
                                    --name ems-reports \
                                    --restart unless-stopped \
                                    -p 8000:8000 \
                                    -e DB_HOST=$DB_HOST \
                                    -e DB_NAME=$DB_NAME \
                                    -e DB_USER=$DB_USER \
                                    -e DB_PASSWORD=$MYSQL_PASSWORD \
                                    $DOCKER_USER/ems-reports:latest

                                echo '→ Cleaning old unused images...'
                                docker image prune -f

                                echo 'All containers running:'
                                docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
                            "
                        '''
                    }
                }
            }
        }
    }

    post {
        success {
            echo "🚀 EMS deployed successfully! Build #${BUILD_NUMBER}"
            echo "🌐 App running at: http://${EC2_HOST}"
        }
        failure {
            echo "❌ Build #${BUILD_NUMBER} failed. Check console logs above."
        }
        always {
            sh 'docker logout || true'
            cleanWs()
        }
    }
}