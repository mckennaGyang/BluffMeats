<?php
class User
{
    private $conn;
    private $table_name = "users";

    public $id;
    public $email;
    public $password;
    public $name;
    public $role;
    public $created_at;

    public function __construct($db)
    {
        $this->conn = $db;
    }

    public function login() {
        try {
            $query = "SELECT id, email, password, name, role, created_at 
                     FROM " . $this->table_name . " 
                     WHERE email = :email 
                     LIMIT 1";
                     
            $stmt = $this->conn->prepare($query);
            
            $this->email = htmlspecialchars(strip_tags($this->email));
            $stmt->bindParam(":email", $this->email);
            
            $stmt->execute();
            return $stmt;
            
        } catch (PDOException $e) {
            error_log("Database error in login(): " . $e->getMessage());
            return false;
        }
    }

    public function create() {
        try {
            $query = "INSERT INTO " . $this->table_name . "
                    SET
                        name = :name,
                        email = :email,
                        password = :password,
                        role = :role,
                        created_at = NOW()";
    
            $stmt = $this->conn->prepare($query);
    
            // Sanitize input
            $this->name = htmlspecialchars(strip_tags($this->name));
            $this->email = htmlspecialchars(strip_tags($this->email));
            $this->password = htmlspecialchars(strip_tags($this->password));
            $this->role = htmlspecialchars(strip_tags($this->role));
    
            // Bind parameters
            $stmt->bindParam(":name", $this->name);
            $stmt->bindParam(":email", $this->email);
            $stmt->bindParam(":password", $this->password);
            $stmt->bindParam(":role", $this->role);
    
            if ($stmt->execute()) {
                return true;
            }
            return false;
        } catch (PDOException $e) {
            error_log("Database error in create(): " . $e->getMessage());
            return false;
        }
    }

    public function emailExists()
    {
        try {
            $query = "SELECT id, password, name, role 
                    FROM " . $this->table_name . "
                    WHERE email = :email LIMIT 1";

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":email", $this->email);

            if (!$stmt->execute()) {
                error_log("Email check failed: " . implode(" ", $stmt->errorInfo()));
                return false;
            }

            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            error_log("Database error in emailExists(): " . $e->getMessage());
            return false;
        }
    }
}
