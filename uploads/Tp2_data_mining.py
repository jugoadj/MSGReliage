import pandas as pd
import numpy as np

# Charger le jeu de données Iris depuis le fichier CSV
data = pd.read_csv('iris.csv')

# Définir la fonction pour convertir les espèces en nombres
def convert_species(species_name):#convertir les (especes) strings en nombres 1,2,3
    if species_name == 'Iris-setosa':
        return 1
    elif species_name == 'Iris-versicolor':
        return 2
    elif species_name == 'Iris-virginica':
        return 3

# Définir la fonction pour convertir le DataFrame en une liste Python
def convert_data(data):#convertire le dataframe pandas en une liste python
    data_list = []
    for index, row in data.iterrows(): #  une boucle qui itère sur chaque ligne du DataFrame.
        species_num = convert_species(row['Species'])# Appelle la fonction convert_species pour convertir le nom de l'espèce en nombre.
        features = [row['SepalLengthCm'], row['SepalWidthCm'], row['PetalLengthCm'], row['PetalWidthCm']]# Crée une liste contenant les valeurs des caractéristiques (longueur et largeur du sépale et du pétale).
        data_list.append([species_num] + features) # Ajoute une liste à data_list qui contient la classe numérique suivie des caractéristiques.
    return data_list

# Appeler la fonction pour convertir le DataFrame en une liste Python
iris_data = convert_data(data)

# Convertir la liste Python en un tableau Numpy
iris_data = np.array(iris_data)

# Mélanger les données aléatoirement
np.random.shuffle(iris_data)

# Extraire les attributs en x et les classes en y
x = iris_data[:, 1:]  # Les colonnes 1 à 4 correspondent aux attributs : : Toutes les lignes du tableau iris_data.
# 1: : À partir de la deuxième colonne (index 1) jusqu'à la fin.
y = iris_data[:, 0]   # toutes es lignes ,La première colonne correspond aux classes

# Normaliser les attributs en utilisant le z-score
x_mean = np.mean(x, axis=0)#calcule la moyenne des valeurs de chaque colonne de la matrice x. La fonction np.mean() avec l'argument axis=0 signifie que vous calculez la moyenne le long de l'axe 0, c'est-à-dire, pour chaque colonne. Le résultat est stocké dans la variable x_mean, qui contient maintenant les moyennes des colonnes d'attributs.
x_std = np.std(x, axis=0)#calcule l'écart-type des valeurs de chaque colonne de la matrice x. La fonction np.std() avec l'argument axis=0 calcule l'écart-type le long de l'axe 0, pour chaque colonne. Le résultat est stocké dans la variable x_std, qui contient maintenant les écarts-types des colonnes d'attributs.

x_normalized = (x - x_mean) / x_std #normalise les attributs en utilisant la formule du z-score
