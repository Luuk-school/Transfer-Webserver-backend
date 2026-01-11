pipeline {
    agent any

    environment {
        REPO_NAME = "main-backend"
        IMAGE_NAME = "luukschool/main-backend"
        IMAGE_TAG = "${BUILD_NUMBER}"
        DOCKER_VM = "192.168.1.3"
        SSH_CREDENTIALS_ID = "docker-vm-ssh"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build & Push Docker Image') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-creds',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh """
                    # Build Docker image
                    docker build -t ${IMAGE_NAME}:${IMAGE_TAG} .
                    docker tag ${IMAGE_NAME}:${IMAGE_TAG} ${IMAGE_NAME}:latest

                    # Login and push
                    echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                    docker push ${IMAGE_NAME}:${IMAGE_TAG}
                    docker push ${IMAGE_NAME}:latest
                    """
                }
            }
        }

        stage('Deploy to Docker VM') {
            steps {
                sshagent([SSH_CREDENTIALS_ID]) {
                    sh """
                        ssh ridderleeuw@${DOCKER_VM} '
                            cd ~/deploy && \
                            docker pull ${IMAGE_NAME}:latest && \
                            docker compose up -d ${REPO_NAME}
                        '
                    """
                }
            }
        }

    post {
        always {
            echo "Pipeline finished. Cleaning up unused Docker images on Jenkins agent."
            sh "docker image prune -f || true"
        }
        failure {
            echo "Pipeline failed!"
        }
    }
}
