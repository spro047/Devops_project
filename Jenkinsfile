pipeline {
    agent any

    triggers {
        pollSCM('* * * * *') // Poll GitHub for changes every minute
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Docker Images') {
            steps {
                script {
                    if (isUnix()) {
                        sh 'docker compose build --no-cache'
                    } else {
                        bat 'docker compose build --no-cache'
                    }
                }
            }
        }

        stage('Deploy Docker Compose') {
            steps {
                script {
                    if (isUnix()) {
                        sh 'docker compose up -d --force-recreate mongodb backend frontend prometheus grafana cadvisor'
                    } else {
                        bat 'docker compose up -d --force-recreate mongodb backend frontend prometheus grafana cadvisor'
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
