pipeline {
    agent any

    environment {
        BACKEND_DIR = 'backend'
        FRONTEND_DIR = 'frontend'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Backend Tests') {
            steps {
                dir("${BACKEND_DIR}") {
                    script {
                        if (isUnix()) {
                            sh 'python -m pip install --upgrade pip'
                            sh 'python -m pip install -r requirements.txt'
                            sh 'python -m pytest'
                        } else {
                            bat 'python -m pip install --upgrade pip'
                            bat 'python -m pip install -r requirements.txt'
                            bat 'python -m pytest'
                        }
                    }
                }
            }
        }

        stage('Frontend Tests') {
            steps {
                dir("${FRONTEND_DIR}") {
                    script {
                        if (isUnix()) {
                            sh 'npm install'
                            sh 'npm test -- --watchAll=false'
                        } else {
                            bat 'npm install'
                            bat 'npm test -- --watchAll=false'
                        }
                    }
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                script {
                    if (isUnix()) {
                        sh 'docker compose build'
                    } else {
                        bat 'docker compose build'
                    }
                }
            }
        }

        stage('Deploy with Docker Compose') {
            steps {
                script {
                    if (isUnix()) {
                        sh 'docker compose up -d'
                    } else {
                        bat 'docker compose up -d'
                    }
                }
            }
        }

        stage('Smoke Check') {
            steps {
                script {
                    if (isUnix()) {
                        sh 'docker ps'
                    } else {
                        bat 'docker ps'
                    }
                }
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully.'
        }
        failure {
            echo 'Pipeline failed. Please inspect Jenkins logs.'
        }
    }
}
