pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Backend Tests') {
            steps {
                echo 'Running Flask tests...'
                sh 'cd backend && pip install -r requirements.txt && python -m pytest'
            }
        }

        stage('Frontend Tests') {
            steps {
                echo 'Running React tests...'
                sh 'cd frontend && npm install && npm test'
            }
        }

        stage('Build Docker Images') {
            steps {
                echo 'Building images...'
                sh 'docker compose build'
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                echo 'Deploying to cluster... (Skipped for local Docker setup)'
                // sh 'kubectl apply -f k8s/'
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed. Check logs.'
        }
    }
}
