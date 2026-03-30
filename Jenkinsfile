pipeline {
    agent any

    environment {
        DOCKER_USER = "swapnilthakare86"
        EC2_HOST = "13.205.135.58"
        DB_HOST = "emp-data.cpg6iaa4wcf8.ap-south-1.rds.amazonaws.com"
        DB_NAME = "emp_data"
        DB_USER = "admin"
        MYSQL_PASSWORD = credentials('mysql-password')
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/Swapnilthakare86/EMS.git'
            }
        }

        stage('Build Backend') {
            steps {
                sh 'docker build -t $DOCKER_USER/ems-backend:latest ./backend'
            }
        }

        stage('Build Frontend') {
            steps {
                sh 'docker build -t $DOCKER_USER/ems-frontend:latest ./frontend'
            }
        }

        stage('Push Docker Images') {
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
                    '''
                }
            }
        }

        stage('Deploy on EC2') {
            steps {
                sshagent(['ec2-ssh-key']) {
                    sh '''
                    ssh -o StrictHostKeyChecking=no ubuntu@$EC2_HOST "
                        docker pull $DOCKER_USER/ems-backend:latest &&
                        docker pull $DOCKER_USER/ems-frontend:latest &&

                        docker stop ems-backend || true &&
                        docker rm ems-backend || true &&
                        docker stop ems-frontend || true &&
                        docker rm ems-frontend || true &&

                        docker run -d --name ems-backend -p 8081:8080 \\
                          -e SPRING_DATASOURCE_URL=jdbc:mysql://$DB_HOST:3306/$DB_NAME \\
                          -e SPRING_DATASOURCE_USERNAME=$DB_USER \\
                          -e SPRING_DATASOURCE_PASSWORD=$MYSQL_PASSWORD \\
                          $DOCKER_USER/ems-backend:latest &&

                        docker run -d --name ems-frontend -p 80:80 \\
                          $DOCKER_USER/ems-frontend:latest
                    "
                    '''
                }
            }
        }
    }

    post {
        success {
            echo 'EMS deployment successful 🚀'
        }
        failure {
            echo 'EMS deployment failed ❌ Check Jenkins console logs'
        }
    }
}