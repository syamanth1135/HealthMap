import csv
import mysql.connector

def insert_hospitals_from_csv(csv_file):
    connection = mysql.connector.connect(
        user='root',
        password='2005',
        host='localhost',
        database='healthmap'
    )
    cursor = connection.cursor()

    # Updated insert query to match the table structure
    insert_query = """
    INSERT INTO hospitalslist (Hospital_Name, Rating, Location, Contact_Number, Opening_Hours, About_Link, Directions_Link, Specialization, Latitude, Longitude)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """

    with open(csv_file, mode='r') as file:
        csv_reader = csv.DictReader(file)
        count = 0  # To count inserted hospitals 

        for row in csv_reader:
            try:
                # Convert Rating, Latitude, and Longitude to the appropriate types
                cursor.execute(insert_query, (
                    row['Hospital_Name'], 
                    float(row['Rating']) if row['Rating'] else None,  # Handle empty values
                    row['Location'], 
                    row['Contact_Number'], 
                    row['Opening_Hours'], 
                    row['About_Link'],  
                    row['Directions_Link'], 
                    row['Specialization'],
                    float(row['Latitude']) if row['Latitude'] else None,  # Handle empty values
                    float(row['Longitude']) if row['Longitude'] else None   # Handle empty values
                ))
                count += 1
            except mysql.connector.Error as e:
                print(f"Error inserting hospital {row['Hospital_Name']}: {e}")
            except ValueError as ve:
                print(f"Value error for hospital {row['Hospital_Name']}: {ve}")

    connection.commit()
    cursor.close()
    connection.close()
    print(f"Inserted {count} hospitals into the database.")

# Call the function to insert data from the CSV file
insert_hospitals_from_csv(r"C:\Users\Divya\Downloads\rajamundry - google (2).csv.csv")
