pipeline {
    agent any

    environment {
        COMPOSE_PROJECT_DIR = "/home/ubuntu/devops"
    }

    stages {
        stage('Pull') {
            steps {
                sh 'cd $COMPOSE_PROJECT_DIR && git pull'
            }
        }

        stage('Deploy') {
            steps {
                sh 'cd $COMPOSE_PROJECT_DIR && docker-compose --env-file .env up -d --build'
            }
        }

        stage('Verify') {
            steps {
                sh 'docker ps'
            }
        }
    }

    post {
        success {
            echo "Deployment Successful!"
        }
        failure {
            echo "Deployment Failed!"
        }
    }
}
