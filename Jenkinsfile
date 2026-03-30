pipeline {
    agent any

    options {
        timeout(time: 30, unit: 'MINUTES')          // Kill build if >30 min 
        disableConcurrentBuilds()                    //  No overlapping builds
        buildDiscarder(logRotator(numToKeepStr: '5'))// Keep only last 5 builds
    }

    environment {
        DOCKER_USER    = "swapnilthakare86"
        EC2_HOST       = "13.205.135.58"
        DB_HOST        = "emp-data.cpg6iaa4wcf8.ap-south-1.rds.amazonaws.com"
        DB_NAME        = "emp_data"
        DB_USER        = "admin"
        MYSQL_PASSWORD = credentials('mysql-password')
        IMAGE_TAG      = "${BUILD_NUMBER}"           //  Tag each build uniquely
    }

    stages {

        // ── 1. Checkout ────────────────────────────────────────────────────────
        // Removed duplicate checkout — only ONE git fetch now
        stage('Checkout') {
            steps {
                checkout scm
                echo "Commit: ${env.GIT_COMMIT?.take(7)} | Branch: ${env.GIT_BRANCH}"
            }
        }

        // ── 2. Build all 3 images IN PARALLEL ─────────────────────────────────
        stage('Build Docker Images') {
            parallel {

                stage('Backend') {
                    options { timeout(time: 10, unit: 'MINUTES') }
                    steps {
                        sh """
                            docker build \
                                --cache-from ${DOCKER_USER}/ems-backend:latest \
                                -t ${DOCKER_USER}/ems-backend:${IMAGE_TAG} \
                                -t ${DOCKER_USER}/ems-backend:latest \
                                ./Backend
                        """
                    }
                }

                stage('Frontend') {
                   
                    options { timeout(time: 15, unit: 'MINUTES') }
                    steps {
                        sh """
                            docker build \
                                --cache-from ${DOCKER_USER}/ems-frontend:latest \
                                -t ${DOCKER_USER}/ems-frontend:${IMAGE_TAG} \
                                -t ${DOCKER_USER}/ems-frontend:latest \
                                ./Frontend
                        """
                    }
                }

                stage('Reports Service') {
                    options { timeout(time: 10, unit: 'MINUTES') }
                    steps {
                        sh """
                            docker build \
                                --cache-from ${DOCKER_USER}/ems-reports:latest \
                                -t ${DOCKER_USER}/ems-reports:${IMAGE_TAG} \
                                -t ${DOCKER_USER}/ems-reports:latest \
                                ./reports-service
                        """
                    }
                }
            }
        }

        // ── 3. Push all images to DockerHub ───────────────────────────────────
        stage('Push Docker Images') {
            options { timeout(time: 10, unit: 'MINUTES') }
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-creds',
                    usernameVariable: 'DOCKER_USERNAME',
                    passwordVariable: 'DOCKER_PASSWORD'
                )]) {
                    sh '''
                        echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin

                        docker push $DOCKER_USER/ems-backend:$IMAGE_TAG
                        docker push $DOCKER_USER/ems-backend:latest

                        docker push $DOCKER_USER/ems-frontend:$IMAGE_TAG
                        docker push $DOCKER_USER/ems-frontend:latest

                        docker push $DOCKER_USER/ems-reports:$IMAGE_TAG
                        docker push $DOCKER_USER/ems-reports:latest
                    '''
                }
            }
        }

        // ── 4. Deploy on EC2 ──────────────────────────────────────────────────
        //  Passes DB credentials securely via -e flags (same as before)
        // Pulls + stops + removes + runs in one clean SSH session
        stage('Deploy on EC2') {
            options { timeout(time: 5, unit: 'MINUTES') }
            steps {
                sshagent(['ec2-ssh-key']) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ubuntu@${EC2_HOST} '
                            set -e

                            echo "→ Pulling latest images..."
                            docker pull ${DOCKER_USER}/ems-backend:latest
                            docker pull ${DOCKER_USER}/ems-frontend:latest
                            docker pull ${DOCKER_USER}/ems-reports:latest

                            echo "→ Stopping old containers..."
                            docker stop ems-backend ems-frontend ems-reports 2>/dev/null || true
                            docker rm   ems-backend ems-frontend ems-reports 2>/dev/null || true

                            echo "→ Starting backend..."
                            docker run -d --name ems-backend \
                                --restart unless-stopped \
                                -p 8081:8080 \
                                -e SPRING_DATASOURCE_URL=jdbc:mysql://${DB_HOST}:3306/${DB_NAME} \
                                -e SPRING_DATASOURCE_USERNAME=${DB_USER} \
                                -e SPRING_DATASOURCE_PASSWORD=${MYSQL_PASSWORD} \
                                ${DOCKER_USER}/ems-backend:latest

                            echo "→ Starting frontend..."
                            docker run -d --name ems-frontend \
                                --restart unless-stopped \
                                -p 80:80 \
                                ${DOCKER_USER}/ems-frontend:latest

                            echo "→ Starting reports service..."
                            docker run -d --name ems-reports \
                                --restart unless-stopped \
                                -p 8000:8000 \
                                -e DB_HOST=${DB_HOST} \
                                -e DB_NAME=${DB_NAME} \
                                -e DB_USER=${DB_USER} \
                                -e DB_PASSWORD=${MYSQL_PASSWORD} \
                                ${DOCKER_USER}/ems-reports:latest

                            echo "→ Cleaning up old images..."
                            docker image prune -f

                            echo "All containers running:"
                            docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
                        '
                    """
                }
            }
        }
    }

    post {
        success {
            echo "🚀 EMS Build #${BUILD_NUMBER} deployed successfully!"
        }
        failure {
            echo "❌ EMS Build #${BUILD_NUMBER} failed. Check console logs above."
        }
        always {
            sh 'docker logout || true'
            cleanWs()                                // Clean workspace after every build
        }
    }
}