import yaml

def data_yaml():
    with open('data.yaml','r') as f:
        return yaml.safe_load(f)
print(data_yaml())
