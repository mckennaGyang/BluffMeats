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

    public function login()
    {
        try {
            // Modified query to match exact table structure
            $query = "SELECT id, email, password, name, role, created_at 
                     FROM " . $this->table_name . "
                     WHERE email = :email 
                     LIMIT 1";

            $stmt = $this->conn->prepare($query);

            // Sanitize email
            $this->email = htmlspecialchars(strip_tags($this->email));

            $stmt->bindParam(":email", $this->email);

            if (!$stmt->execute()) {
                error_log("Login query failed: " . implode(" ", $stmt->errorInfo()));
                return false;
            }

            return $stmt;
        } catch (PDOException $e) {
            error_log("Database error in login(): " . $e->getMessage());
            return false;
        }
    }

    public function create()
    {
        try {
            $query = "INSERT INTO " . $this->table_name . "
                    SET
                        email = :email,
                        password = :password,
                        name = :name,
                        role = :role";

            $stmt = $this->conn->prepare($query);

            // Sanitize inputs
            $this->email = htmlspecialchars(strip_tags($this->email));
            $this->name = htmlspecialchars(strip_tags($this->name));
            $this->role = htmlspecialchars(strip_tags($this->role));

            // Hash the password
            $password_hash = password_hash($this->password, PASSWORD_BCRYPT);

            $stmt->bindParam(":email", $this->email);
            $stmt->bindParam(":password", $password_hash);
            $stmt->bindParam(":name", $this->name);
            $stmt->bindParam(":role", $this->role);

            return $stmt->execute();
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
