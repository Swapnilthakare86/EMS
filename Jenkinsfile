pipeline {
    agent any

    options {
        timeout(time: 40, unit: 'MINUTES')
        disableConcurrentBuilds()
    }

    environment {
        DOCKER_USER = "swapnilthakare86"
        EC2_HOST = "13.205.135.58"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
                echo "✅ Code checked out"
            }
        }

        stage('Build Images') {
            steps {
                sh '''
                    export DOCKER_BUILDKIT=0

                    echo "→ Building Backend"
                    docker build -t $DOCKER_USER/ems-backend:latest ./Backend

                    echo "→ Building Frontend"
                    docker build -t $DOCKER_USER/ems-frontend:latest ./Frontend

                    echo "→ Building Reports"
                    docker build -t $DOCKER_USER/ems-reports:latest ./reports-service
                '''
            }
        }

        stage('Push Images') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-creds',
                    usernameVariable: 'DOCKER_USERNAME',
                    passwordVariable: 'DOCKER_PASSWORD'
                )]) {
                    sh '''
                        echo $DOCKER_PASSWORD | docker login -u $DOCKER_USERNAME --password-stdin

                        docker push $DOCKER_USER/ems-backend:latest
                        docker push $DOCKER_USER/ems-frontend:latest
                        docker push $DOCKER_USER/ems-reports:latest
                    '''
                }
            }
        }

        stage('Deploy on EC2') {
            steps {
                sshagent(['ec2-ssh-key']) {
                    sh '''
                        ssh -o StrictHostKeyChecking=no ubuntu@$EC2_HOST "

                            cd /home/ubuntu/devops

                            echo '→ Pull latest code'
                            git pull

                            echo '→ Pull latest images'
                            docker-compose pull

                            echo '→ Restart services'
                            docker-compose --env-file .env up -d

                            echo '→ Cleanup'
                            docker image prune -f

                            echo '✅ Deployment Done'
                            docker ps
                        "
                    '''
                }
            }
        }
    }

    post {
        success {
            echo "🚀 Deployment successful"
            echo "🌐 http://${EC2_HOST}"
        }
        failure {
            echo "❌ Deployment failed"
        }
    }
}