import sqlite3

def check_data():
    conn = sqlite3.connect('devops_lab.db')
    cursor = conn.cursor()
    
    print("--- LABS ---")
    cursor.execute("SELECT id, title FROM lab")
    for row in cursor.fetchall():
        print(row)
        
    print("\n--- VERSIONS ---")
    cursor.execute("SELECT id, lab_id, version_number, instructions_markdown, is_active FROM labversion")
    for row in cursor.fetchall():
        print(f"ID: {row[0]}, LabID: {row[1]}, Ver: {row[2]}, Active: {row[4]}")
        print(f"Instructions: {row[3][:50]}...")
        
    conn.close()

if __name__ == "__main__":
    check_data()
