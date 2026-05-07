import docker

client = docker.from_env()
# Try to find the latest devops-lab container
containers = client.containers.list(filters={"label": "managed_by=devops-guru"})
if not containers:
    print("No managed containers found. Creating one...")
    container = client.containers.run(
        "alpine:latest",
        detach=True,
        tty=True,
        command="sh -c 'while true; do sleep 3600; done'",
        labels={"managed_by": "devops-guru"}
    )
else:
    container = containers[0]

print(f"Using container: {container.name}")

cmds = ["ls -la", "whoami", "pwd", "touch test.txt", "ls"]
for cmd in cmds:
    print(f"\nRunning: {cmd}")
    res = container.exec_run(f"sh -c '{cmd}'")
    print(f"Exit code: {res.exit_code}")
    print(f"Output: '{res.output.decode('utf-8')}'")

# cleanup if we created it
if not containers:
    container.stop()
    container.remove()
