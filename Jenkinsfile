pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Deploy EMS') {
            steps {
                withCredentials([file(credentialsId: 'ems-env-file', variable: 'ENV_FILE')]) {
                    sh '''
                        set -e
                        cd $WORKSPACE
                        cp $ENV_FILE .env

                        echo "Stopping old containers"
                        docker-compose down || true

                        echo "Building and starting new stack"
                        docker-compose up -d --build

                        echo "Running containers"
                        docker ps
                    '''
                }
            }
        }
    }
    post {
        success {
            echo 'Deployment successful'
        }
        failure {
            echo 'Deployment failed'
        }
    }
}
