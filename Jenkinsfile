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
                sh '''
                    set -e
                    cd $WORKSPACE

                    echo "🛑 Stop old containers"
                    docker-compose down || true

                    echo "🚀 Build and start new stack"
                    docker-compose up -d --build

                    echo "📦 Running containers"
                    docker ps
                '''
            }
        }
    }
    post {
        success {
            echo '✅ Deployment successful'
        }
        failure {
            echo '❌ Deployment failed'
        }
    }
}
