<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$db_file = dirname(__DIR__) . '/db.json';

if (!file_exists($db_file)) {
    http_response_code(500);
    echo json_encode(["error" => "Database file not found"]);
    exit;
}

$input = file_get_contents('php://input');
$request = json_decode($input, true);

$transcript = isset($request['transcript']) ? $request['transcript'] : (isset($request['message']) ? $request['message'] : '');
$languagePreference = isset($request['languagePreference']) ? $request['languagePreference'] : 'English';

if (empty($transcript)) {
    http_response_code(400);
    echo json_encode(["error" => "Transcript is required"]);
    exit;
}

$db = json_decode(file_get_contents($db_file), true);
$rawText = strtolower(trim($transcript));
$today = date('Y-m-d');

$result = [
    "success" => false,
    "message" => "Command not recognized. Please try again or use standard templates.",
    "speechText" => [
        "en" => "Sorry, I could not understand that command.",
        "ta" => "மன்னிக்கவும், அந்த கட்டளையை என்னால் புரிந்து கொள்ள முடியவில்லை."
    ],
    "action" => null
];

// --- GROQ API PARSING INTEGRATION ---
include_once __DIR__ . '/config.php';
$groqUrl = "https://api.groq.com/openai/v1/chat/completions";

$studentsContext = [];
if (isset($db['students'])) {
    foreach ($db['students'] as $s) {
        if (isset($s['status']) && $s['status'] === 'Active') {
            $studentsContext[] = [
                "id" => $s['id'],
                "name" => $s['name'],
                "class" => $s['class']
            ];
        }
    }
}
$staffContext = [];
if (isset($db['staff'])) {
    foreach ($db['staff'] as $s) {
        if (isset($s['status']) && $s['status'] === 'Active') {
            $staffContext[] = [
                "id" => $s['id'],
                "name" => $s['name'],
                "role" => $s['role']
            ];
        }
    }
}
$tasksContext = [];
if (isset($db['tasks'])) {
    foreach ($db['tasks'] as $t) {
        if (isset($t['status']) && $t['status'] !== 'Done') {
            $tasksContext[] = [
                "id" => $t['id'],
                "title" => $t['title'],
                "status" => $t['status']
            ];
        }
    }
}

$systemPrompt = "You are the Natural Language Processing (NLP) engine for a preschool SaaS voice assistant called 'Sorted OS'. " .
"Your task is to parse a spoken voice transcript (which may be in English, Indian English, or transliterated Tamil, or Tamil script) " .
"and output a structured JSON action to execute on the database.\n\n" .
"Here is the database context you need for resolving names:\n" .
"ACTIVE STUDENTS:\n" . json_encode($studentsContext) . "\n\n" .
"ACTIVE STAFF:\n" . json_encode($staffContext) . "\n\n" .
"ACTIVE TASKS (NOT COMPLETED):\n" . json_encode($tasksContext) . "\n\n" .
"CURRENT DATE: " . date('Y-m-d') . "\n\n" .
"COMMAND SPECIFICATIONS & EXAMPLES:\n" .
"1. MARK_ATTENDANCE:\n" .
"   - Example: 'mark attendance for LKG' -> {\"type\": \"MARK_ATTENDANCE\", \"targetClass\": \"LKG\", \"status\": \"Present\"}\n" .
"   - Example: 'take attendance for nursery' -> {\"type\": \"MARK_ATTENDANCE\", \"targetClass\": \"Nursery\", \"status\": \"Present\"}\n" .
"   - Example: 'Abhi irukkan' -> {\"type\": \"MARK_ATTENDANCE\", \"studentId\": \"S108\", \"status\": \"Present\"}\n" .
"   - Example: 'Aarav absent' or 'Aarav varala' -> {\"type\": \"MARK_ATTENDANCE\", \"studentId\": \"S101\", \"status\": \"Absent\"}\n" .
"2. CREATE_TASK:\n" .
"   - Example: 'create a task for Ramesh clean the board' -> {\"type\": \"CREATE_TASK\", \"title\": \"Clean the board\", \"assignedTo\": \"ST205\", \"category\": \"Cleaning\", \"priority\": \"Medium\"}\n" .
"   - Example: 'assign a task to Savitri to mop the classroom' -> {\"type\": \"CREATE_TASK\", \"title\": \"Mop the classroom\", \"assignedTo\": \"ST203\", \"category\": \"Cleaning\", \"priority\": \"Medium\"}\n" .
"   - Example: 'add new task' or 'create task' or 'new task' (vague) -> {\"type\": \"CREATE_TASK\", \"title\": \"General housekeeping\", \"assignedTo\": \"ST203\", \"category\": \"Cleaning\", \"priority\": \"Medium\"}\n" .
"   - IMPORTANT: If user says any variation of 'add task', 'new task', 'create task', 'set a task' WITHOUT details, ALWAYS succeed with title='General housekeeping' and assignedTo='ST203'. NEVER return success:false for task commands.\n" .
"3. UPDATE_TASK:\n" .
"   - Use this when user wants to complete, start, or change status of a task.\n" .
"   - Example: 'mark clean the washroom done' -> {\"type\": \"UPDATE_TASK\", \"taskId\": \"T373\", \"status\": \"Done\"}\n" .
"   - Example: 'set task repair playground swing to in progress' -> {\"type\": \"UPDATE_TASK\", \"taskId\": \"T403\", \"status\": \"In Progress\"}\n" .
"   - Example: 'complete task sanitize play area blocks' -> {\"type\": \"UPDATE_TASK\", \"taskId\": \"T401\", \"status\": \"Done\"}\n" .
"4. ADD_INVENTORY:\n" .
"   - Example: 'add safety scissors' or 'add inventory item safety scissors' -> {\"type\": \"ADD_INVENTORY\", \"itemName\": \"Safety Scissors\"}\n" .
"5. NAVIGATE:\n" .
"   - Example: 'go to students' or 'open tasks' or 'show inventory' -> {\"type\": \"NAVIGATE\", \"targetView\": \"students\"}\n" .
"   - Valid target views: 'dashboard', 'students', 'staff', 'attendance', 'tasks', 'inventory', 'cleaning', 'lessons', 'activities', 'communication', 'settings', 'voice-portal'\n" .
"6. ADD_STUDENT:\n" .
"   - Example: 'add student Rachel' or 'enroll a student named Rachel' -> {\"type\": \"ADD_STUDENT\", \"name\": \"Rachel\", \"class\": \"LKG\"}\n" .
"   - Example: 'add a student named John in UKG' -> {\"type\": \"ADD_STUDENT\", \"name\": \"John\", \"class\": \"UKG\"}\n" .
"7. REMOVE_STUDENT:\n" .
"   - Example: 'remove student Aarav' or 'delete student Kabir' -> {\"type\": \"REMOVE_STUDENT\", \"studentId\": \"S101\"}\n\n" .
"CRITICAL RULES:\n" .
"- ALWAYS return success:true when the intent is clear, even if details are vague — use sensible defaults.\n" .
"- For CREATE_TASK with no staff name: use assignedTo='ST203' (Savitri Devi), title='General housekeeping'.\n" .
"- For CREATE_TASK with a staff name but no title: use title='General housekeeping'.\n" .
"- For ADD_INVENTORY with no item name: use itemName='General Supplies'.\n" .
"- Only return success:false when the transcript is completely unrelated to school management.\n\n" .
"GUIDELINES FOR OUTPUT:\n" .
"- Respond ONLY with a valid JSON object matching the following structure:\n" .
"{\n" .
"  \"success\": true,\n" .
"  \"message\": \"Detailed user-facing confirmation message in English explaining what action was performed\",\n" .
"  \"speechText\": {\n" .
"    \"en\": \"English response to read aloud\",\n" .
"    \"ta\": \"Tamil response to read aloud in Tamil script\"\n" .
"  },\n" .
"  \"action\": {\n" .
"    \"type\": \"MARK_ATTENDANCE\" | \"CREATE_TASK\" | \"UPDATE_TASK\" | \"ADD_INVENTORY\" | \"NAVIGATE\" | \"ADD_STUDENT\" | \"REMOVE_STUDENT\",\n" .
"    // fields corresponding to the matched command\n" .
"  }\n" .
"}\n" .
"- If a command is vague but relates to a category like task or navigation, interpret it using defaults rather than failing.\n" .
"- If absolutely no intent could be parsed, return `\"success\": false` with an appropriate message.\n" .
"- Do not include markdown formatting or backticks around the JSON. Return only the JSON object.";

$postData = [
    "model" => "llama-3.3-70b-versatile",
    "messages" => [
        [
            "role" => "system",
            "content" => $systemPrompt
        ],
        [
            "role" => "user",
            "content" => "User Spoke: \"" . $transcript . "\""
        ]
    ],
    "response_format" => [
        "type" => "json_object"
    ],
    "temperature" => 0.1
];

$groqSuccess = false;
$parsedResponse = null;

try {
    $ch = curl_init($groqUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($postData));
    curl_setopt($ch, CURLOPT_TIMEOUT, 6);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Authorization: Bearer " . $apiKey,
        "Content-Type: application/json"
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode === 200 && $response) {
        $apiData = json_decode($response, true);
        if (isset($apiData['choices'][0]['message']['content'])) {
            $contentStr = trim($apiData['choices'][0]['message']['content']);
            $parsedResponse = json_decode($contentStr, true);
            if ($parsedResponse && isset($parsedResponse['success'])) {
                $groqSuccess = true;
            }
        }
    }
} catch (Exception $e) {
    $groqSuccess = false;
}

if ($groqSuccess && $parsedResponse) {
    $result = $parsedResponse;
    $action = isset($result['action']) ? $result['action'] : null;

    if ($result['success'] && $action) {
        $actionType = $action['type'];
        $remarks = "Voice command (Groq API)";

        if ($actionType === 'MARK_ATTENDANCE') {
            $studentStatus = isset($action['status']) ? $action['status'] : 'Present';
            if (isset($action['studentId']) && !empty($action['studentId'])) {
                $studentId = $action['studentId'];
                $attendanceList = isset($db['attendance']['students']) ? $db['attendance']['students'] : [];
                $foundRecord = false;
                foreach ($attendanceList as &$item) {
                    if ($item['date'] === $today && $item['studentId'] === $studentId) {
                        $item['status'] = $studentStatus;
                        $item['remarks'] = $remarks;
                        $foundRecord = true;
                        break;
                    }
                }
                if (!$foundRecord) {
                    $attendanceList[] = [
                        "date" => $today,
                        "studentId" => $studentId,
                        "status" => $studentStatus,
                        "remarks" => $remarks
                    ];
                }
                $db['attendance']['students'] = $attendanceList;
            } elseif (isset($action['targetClass']) && !empty($action['targetClass'])) {
                $targetClass = $action['targetClass'];
                $studentsList = isset($db['students']) ? $db['students'] : [];
                $attendanceList = isset($db['attendance']['students']) ? $db['attendance']['students'] : [];

                foreach ($studentsList as $student) {
                    if (isset($student['status']) && $student['status'] === 'Active' && $student['class'] === $targetClass) {
                        $found = false;
                        foreach ($attendanceList as &$item) {
                            if ($item['date'] === $today && $item['studentId'] === $student['id']) {
                                $item['status'] = $studentStatus;
                                $item['remarks'] = $remarks;
                                $found = true;
                                break;
                            }
                        }
                        if (!$found) {
                            $attendanceList[] = [
                                "date" => $today,
                                "studentId" => $student['id'],
                                "status" => $studentStatus,
                                "remarks" => $remarks
                            ];
                        }
                    }
                }
                $db['attendance']['students'] = $attendanceList;
            }
        }
        
        elseif ($actionType === 'CREATE_TASK') {
            $title = isset($action['title']) ? $action['title'] : 'Housekeeping assignment';
            $assignedTo = isset($action['assignedTo']) ? $action['assignedTo'] : 'ST203';
            $priority = isset($action['priority']) ? $action['priority'] : 'Medium';
            $category = isset($action['category']) ? $action['category'] : 'Cleaning';

            $newTask = [
                "id" => "T" . substr(time(), -3),
                "title" => $title,
                "description" => "Voice task assigned from Groq NLP: " . $title,
                "assignedTo" => $assignedTo,
                "priority" => $priority,
                "status" => "Pending",
                "dueDate" => $today,
                "category" => $category
            ];
            if (!isset($db['tasks'])) {
                $db['tasks'] = [];
            }
            $db['tasks'][] = $newTask;
            $result['action']['task'] = $newTask;
        }

        elseif ($actionType === 'UPDATE_TASK') {
            $taskId = isset($action['taskId']) ? $action['taskId'] : '';
            $status = isset($action['status']) ? $action['status'] : 'Done';
            
            $tasksList = isset($db['tasks']) ? $db['tasks'] : [];
            $taskUpdated = false;
            
            foreach ($tasksList as &$t) {
                if ($t['id'] === $taskId) {
                    $t['status'] = $status;
                    $taskUpdated = true;
                    break;
                }
            }
            if ($taskUpdated) {
                $db['tasks'] = $tasksList;
            }
        }

        elseif ($actionType === 'ADD_INVENTORY') {
            $itemName = isset($action['itemName']) ? $action['itemName'] : 'Crayons Set';
            $inventoryList = isset($db['inventory']) ? $db['inventory'] : [];
            $itemIndex = -1;
            for ($i = 0; $i < count($inventoryList); $i++) {
                if (strtolower($inventoryList[$i]['name']) === strtolower($itemName)) {
                    $itemIndex = $i;
                    break;
                }
            }

            if ($itemIndex > -1) {
                $inventoryList[$itemIndex]['stockLevel'] += 10;
            } else {
                $newItem = [
                    "id" => "INV" . substr(time(), -3),
                    "name" => $itemName,
                    "category" => "Replaceable items",
                    "stockLevel" => 10,
                    "minStockLevel" => 5,
                    "unit" => "units"
                ];
                $inventoryList[] = $newItem;
            }
            $db['inventory'] = $inventoryList;
        }

        elseif ($actionType === 'ADD_STUDENT') {
            $studentName = isset($action['name']) ? ucwords(strtolower(trim($action['name']))) : 'New Student';
            $studentClass = isset($action['class']) ? $action['class'] : 'LKG';

            $existingIds = array_column(isset($db['students']) ? $db['students'] : [], 'id');
            $maxId = 100;
            foreach ($existingIds as $sid) {
                $num = intval(substr($sid, 1));
                if ($num > $maxId) $maxId = $num;
            }
            $newId = 'S' . ($maxId + 1);

            $newStudent = [
                "id"             => $newId,
                "name"           => $studentName,
                "class"          => $studentClass,
                "section"        => "A",
                "age"            => 4,
                "parentName"     => "Parent of " . $studentName,
                "parentPhone"    => "+91 00000 00000",
                "email"          => strtolower(str_replace(' ', '.', $studentName)) . "@example.com",
                "status"         => "Active",
                "enrollmentDate" => $today
            ];

            if (!isset($db['students'])) $db['students'] = [];
            $db['students'][] = $newStudent;
            $result['action']['student'] = $newStudent;
        }

        elseif ($actionType === 'REMOVE_STUDENT') {
            $studentId = isset($action['studentId']) ? $action['studentId'] : '';
            if ($studentId) {
                $studentsList = isset($db['students']) ? $db['students'] : [];
                foreach ($studentsList as &$s) {
                    if ($s['id'] === $studentId) {
                        $s['status'] = 'Inactive';
                        break;
                    }
                }
                $db['students'] = $studentsList;
            }
        }
    }
} else {
    // 1. MARK ATTENDANCE
    if (strpos($rawText, 'mark attendance for') !== false || strpos($rawText, 'mark attendance') !== false || strpos($rawText, 'take attendance') !== false) {
        $targetClass = 'LKG';
        $targetTamilClass = 'எல்.கே.ஜி';
        
        if (strpos($rawText, 'nursery') !== false) {
            $targetClass = 'Nursery';
            $targetTamilClass = 'நர்சரி';
        } elseif (strpos($rawText, 'play group') !== false || strpos($rawText, 'playgroup') !== false) {
            $targetClass = 'Play Group';
            $targetTamilClass = 'ப்ளே குரூப்';
        } elseif (strpos($rawText, 'ukg') !== false) {
            $targetClass = 'UKG';
            $targetTamilClass = 'யு.கே.ஜி';
        }

        $studentsList = isset($db['students']) ? $db['students'] : [];
        $attendanceList = isset($db['attendance']['students']) ? $db['attendance']['students'] : [];
        $classStudents = [];
        
        foreach ($studentsList as $s) {
            if ($s['status'] === 'Active' && $s['class'] === $targetClass) {
                $classStudents[] = $s;
            }
        }

        if (count($classStudents) > 0) {
            foreach ($classStudents as $student) {
                $found = false;
                foreach ($attendanceList as &$item) {
                    if ($item['date'] === $today && $item['studentId'] === $student['id']) {
                        $item['status'] = 'Present';
                        $item['remarks'] = 'Voice command (PHP Backend)';
                        $found = true;
                        break;
                    }
                }
                if (!$found) {
                    $attendanceList[] = [
                        "date" => $today,
                        "studentId" => $student['id'],
                        "status" => "Present",
                        "remarks" => "Voice command (PHP Backend)"
                    ];
                }
            }
            
            $db['attendance']['students'] = $attendanceList;
            $result['success'] = true;
            $result['message'] = "Marked attendance for all students in class " . $targetClass . ".";
            $result['speechText'] = [
                "en" => "Attendance marked successfully for class " . $targetClass . ".",
                "ta" => $targetTamilClass . " வகுப்பிற்கு வருகை பதிவு செய்யப்பட்டது."
            ];
            $result['action'] = [
                "type" => "MARK_ATTENDANCE",
                "targetClass" => $targetClass
            ];
        } else {
            $result['message'] = "No active students found in class " . $targetClass . ".";
            $result['speechText'] = [
                "en" => "No active students found in class " . $targetClass . ".",
                "ta" => $targetTamilClass . " வகுப்பில் மாணவர்கள் யாரும் இல்லை."
            ];
        }
    }

    // 2. CREATE TASK
    elseif (preg_match('/create\s+(a\s+)?task|assign\s+(a\s+)?task|new\s+task/i', $rawText)) {
        $assigneeId = 'ST203'; // Savitri
        $assigneeName = 'Savitri Devi';
        $assigneeTamil = 'சாவித்திரி தேவி';

        if (strpos($rawText, 'ramesh') !== false || strpos($rawText, 'kitchen') !== false || strpos($rawText, 'maintenance') !== false) {
            $assigneeId = 'ST205';
            $assigneeName = 'Ramesh Kumar';
            $assigneeTamil = 'ரமேஷ் குமார்';
        } elseif (strpos($rawText, 'priya') !== false || strpos($rawText, 'lkg teacher') !== false) {
            $assigneeId = 'ST201';
            $assigneeName = 'Priya Sen';
            $assigneeTamil = 'பிரியா சென்';
        } elseif (strpos($rawText, 'anita') !== false || strpos($rawText, 'ukg teacher') !== false) {
            $assigneeId = 'ST204';
            $assigneeName = 'Anita Kapoor';
            $assigneeTamil = 'அனிதா கபூர்';
        } elseif (strpos($rawText, 'admin') !== false || strpos($rawText, 'rohan') !== false) {
            $assigneeId = 'ST202';
            $assigneeName = 'Rohan Das';
            $assigneeTamil = 'ரோஹன் தாஸ்';
        }

        $taskTitle = 'Housekeeping assignment';
        $splitKeywords = ['staff', 'for', 'to'];
        $parsedTitle = '';
        
        foreach ($splitKeywords as $kw) {
          $idx = strpos($rawText, $kw);
          if ($idx !== false) {
            $rawSuffix = trim(substr($transcript, $idx + strlen($kw)));
            $cleanSuffix = trim(preg_replace('/savitri|ramesh|priya|anita|rohan|cleaning staff|support staff/i', '', $rawSuffix));
            if (strlen($cleanSuffix) > 3) {
              $parsedTitle = $cleanSuffix;
              break;
            }
          }
        }

        if ($parsedTitle) {
          $taskTitle = ucfirst($parsedTitle);
        }

        $newTask = [
          "id" => "T" . substr(time(), -3),
          "title" => $taskTitle,
          "description" => "Voice task assigned from PHP backend: " . $taskTitle,
          "assignedTo" => $assigneeId,
          "priority" => "Medium",
          "status" => "Pending",
          "dueDate" => $today,
          "category" => "Cleaning"
        ];

        $db['tasks'][] = $newTask;
        
        $result['success'] = true;
        $result['message'] = "Created task \"" . $taskTitle . "\" and assigned to " . $assigneeName . ".";
        $result['speechText'] = [
          "en" => "Task assigned successfully to " . $assigneeName . ".",
          "ta" => "பணி வெற்றிகரமாக உருவாக்கப்பட்டு " . $assigneeTamil . "விடம் ஒப்படைக்கப்பட்டது."
        ];
        $result['action'] = [
          "type" => "CREATE_TASK",
          "task" => $newTask
        ];
    }

    // 3. ADD INVENTORY
    elseif (preg_match('/add\s+(an?\s+)?(inventory|material|item)|restock/i', $rawText)) {
        $itemName = 'Crayons Set';
        $matchKeywords = ['inventory', 'material', 'item'];
        
        foreach ($matchKeywords as $kw) {
          $idx = strpos($rawText, $kw);
          if ($idx !== false) {
            $rawItem = trim(substr($transcript, $idx + strlen($kw)));
            if (strlen($rawItem) > 2) {
              $itemName = ucfirst($rawItem);
              break;
            }
          }
        }

        $inventoryList = isset($db['inventory']) ? $db['inventory'] : [];
        $itemIndex = -1;
        for ($i = 0; $i < count($inventoryList); $i++) {
            if (strtolower($inventoryList[$i]['name']) === strtolower($itemName)) {
                $itemIndex = $i;
                break;
            }
        }

        if ($itemIndex > -1) {
            $inventoryList[$itemIndex]['stockLevel'] += 10;
            $result['message'] = "Updated stock level of \"" . $inventoryList[$itemIndex]['name'] . "\" (+10).";
        } else {
            $newItem = [
                "id" => "INV" . substr(time(), -3),
                "name" => $itemName,
                "category" => "Replaceable items",
                "stockLevel" => 10,
                "minStockLevel" => 5,
                "unit" => "units"
            ];
            $inventoryList[] = $newItem;
            $result['message'] = "Added new item \"" . $itemName . "\" to inventory ledger with 10 units.";
        }

        $db['inventory'] = $inventoryList;
        $result['success'] = true;
        $result['speechText'] = [
            "en" => "Inventory ledger updated successfully for " . $itemName . ".",
            "ta" => "சரக்கு புத்தகத்தில் " . $itemName . " சேர்க்கப்பட்டது."
        ];
        $result['action'] = [
            "type" => "ADD_INVENTORY",
            "itemName" => $itemName
        ];
    }

    // 4. NAVIGATION
    elseif (preg_match('/go\s+to|open\s+(the\s+)?|show\s+(me\s+)?|navigate\s+to|switch\s+to/i', $rawText)) {
        $targetView = 'dashboard';
        $viewName = 'Dashboard';
        $viewTamil = 'முகப்பு';

        if (strpos($rawText, 'student') !== false) { $targetView = 'students'; $viewName = 'Students'; $viewTamil = 'மாணவர்கள்'; }
        elseif (strpos($rawText, 'staff') !== false) { $targetView = 'staff'; $viewName = 'Staff Management'; $viewTamil = 'பணியாளர்கள்'; }
        elseif (strpos($rawText, 'attendance') !== false) { $targetView = 'attendance'; $viewName = 'Attendance'; $viewTamil = 'வருகை'; }
        elseif (strpos($rawText, 'task') !== false || strpos($rawText, 'board') !== false) { $targetView = 'tasks'; $viewName = 'Tasks Board'; $viewTamil = 'பணிகள்'; }
        elseif (strpos($rawText, 'inventory') !== false || strpos($rawText, 'material') !== false) { $targetView = 'inventory'; $viewName = 'Inventory Ledger'; $viewTamil = 'சரக்கு'; }
        elseif (strpos($rawText, 'cleaning') !== false || strpos($rawText, 'housekeeping') !== false) { $targetView = 'cleaning'; $viewName = 'Support & Cleaning'; $viewTamil = 'சுத்தம்'; }
        elseif (strpos($rawText, 'lesson') !== false) { $targetView = 'lessons'; $viewName = 'Lesson Planning'; $viewTamil = 'பாடத் திட்டம்'; }
        elseif (strpos($rawText, 'activit') !== false || strpos($rawText, 'event') !== false) { $targetView = 'activities'; $viewName = 'Activities & Events'; $viewTamil = 'செயல்பாடுகள்'; }
        elseif (strpos($rawText, 'messag') !== false || strpos($rawText, 'chat') !== false || strpos($rawText, 'communication') !== false) { $targetView = 'communication'; $viewName = 'Communication'; $viewTamil = 'தொடர்பு'; }
        elseif (strpos($rawText, 'setting') !== false) { $targetView = 'settings'; $viewName = 'Settings'; $viewTamil = 'அமைப்புகள்'; }
        elseif (strpos($rawText, 'voice') !== false || strpos($rawText, 'portal') !== false || strpos($rawText, 'assistant') !== false) { $targetView = 'voice-portal'; $viewName = 'Voice Assistant Portal'; $viewTamil = 'குரல் உதவியாளர்'; }

        $result['success'] = true;
        $result['message'] = "Navigated to " . $viewName . ".";
        $result['speechText'] = [
            "en" => "Switching to " . $viewName . " screen.",
            "ta" => $viewTamil . " பக்கத்திற்கு மாற்றப்படுகிறது."
        ];
        $result['action'] = [
            "type" => "NAVIGATE",
            "targetView" => $targetView
        ];
    }

    // 5. ADD A NEW STUDENT
    elseif (preg_match('/add\s+(a\s+)?student|enroll\s+(a\s+)?student|register\s+(a\s+)?student|new\s+student|^add\s+(?!a\s|an\s|item|task|inventory|liquid|soap|glue|hand)([a-z])/i', $rawText)) {
        $studentName = 'New Student';
        if (preg_match('/(?:named?|called)\s+([A-Za-z]+(?:\s+[A-Za-z]+)?)/i', $transcript, $nameMatch)) {
            $studentName = ucwords(strtolower(trim($nameMatch[1])));
        } elseif (preg_match('/^add\s+([A-Za-z]+(?:\s+[A-Za-z]+)?)/i', $transcript, $nameMatch)) {
            $candidate = trim($nameMatch[1]);
            if (!preg_match('/^(a|an|item|task|inventory|student|liquid|soap|glue|hand)$/i', $candidate)) {
                $studentName = ucwords(strtolower($candidate));
            }
        }

        $studentClass = 'LKG';
        if (stripos($rawText, 'nursery') !== false) $studentClass = 'Nursery';
        elseif (stripos($rawText, 'play group') !== false || stripos($rawText, 'playgroup') !== false) $studentClass = 'Play Group';
        elseif (stripos($rawText, 'ukg') !== false) $studentClass = 'UKG';
        elseif (stripos($rawText, 'lkg') !== false) $studentClass = 'LKG';

        $existingIds = array_column(isset($db['students']) ? $db['students'] : [], 'id');
        $maxId = 100;
        foreach ($existingIds as $sid) {
            $num = intval(substr($sid, 1));
            if ($num > $maxId) $maxId = $num;
        }
        $newId = 'S' . ($maxId + 1);

        $newStudent = [
            "id"             => $newId,
            "name"           => $studentName,
            "class"          => $studentClass,
            "section"        => "A",
            "age"            => 4,
            "parentName"     => "Parent of " . $studentName,
            "parentPhone"    => "+91 00000 00000",
            "email"          => strtolower(str_replace(' ', '.', $studentName)) . "@example.com",
            "status"         => "Active",
            "enrollmentDate" => $today
        ];

        if (!isset($db['students'])) $db['students'] = [];
        $db['students'][] = $newStudent;

        $result['success'] = true;
        $result['message'] = "Added new student \"" . $studentName . "\" (ID: $newId) to " . $studentClass . " class.";
        $result['speechText'] = [
            "en" => "Student " . $studentName . " has been enrolled successfully in class " . $studentClass . ".",
            "ta" => $studentName . " மாணவராக " . $studentClass . " வகுப்பில் சேர்க்கப்பட்டார்."
        ];
        $result['action'] = [
            "type"    => "ADD_STUDENT",
            "student" => $newStudent
        ];
    }

    // 6. REMOVE / DEACTIVATE A STUDENT
    elseif (preg_match('/remove\s+student|delete\s+student|deactivate\s+student|discharge\s+student/i', $rawText)) {
        $foundStudent = null;
        $studentsList = isset($db['students']) ? $db['students'] : [];

        if (preg_match('/(?:remove|delete|deactivate|discharge)\s+student\s+([A-Za-z]+)/i', $transcript, $m)) {
            $targetName = strtolower(trim($m[1]));
            foreach ($studentsList as &$s) {
                $parts = explode(' ', strtolower($s['name']));
                if (in_array($targetName, $parts)) { $foundStudent = &$s; break; }
            }
        }

        if ($foundStudent !== null) {
            $foundStudent['status'] = 'Inactive';
            $db['students'] = $studentsList;
            $result['success'] = true;
            $result['message'] = "Student " . $foundStudent['name'] . " has been deactivated.";
            $result['speechText'] = [
                "en" => $foundStudent['name'] . " has been removed from the active student list.",
                "ta" => $foundStudent['name'] . " மாணவர் பட்டியலிலிருந்து நீக்கப்பட்டார்."
            ];
            $result['action'] = ["type" => "REMOVE_STUDENT", "studentId" => $foundStudent['id']];
        } else {
            $result['message'] = "Could not find a student to remove. Please say the student's first name clearly.";
            $result['speechText'] = [
                "en" => "Student not found. Please say the name clearly.",
                "ta" => "மாணவர் கண்டுபிடிக்கப்படவில்லை. தெளிவாக பெயர் சொல்லுங்கள்."
            ];
        }
    }

    // 7. INDIVIDUAL STUDENT ATTENDANCE BY NAME (FALLBACK MATCH)
    else {
        $foundStudent = null;
        $studentStatus = 'Present';
        $statusTamil = 'வருகை பதிவு செய்யப்பட்டது';
        $statusEnglish = 'Present';

        $studentsList = isset($db['students']) ? $db['students'] : [];
        foreach ($studentsList as $s) {
            if ($s['status'] === 'Active') {
                $parts = explode(' ', strtolower($s['name']));
                $firstName = $parts[0];
                
                if (strpos($rawText, $firstName) !== false) {
                    $foundStudent = $s;
                    break;
                }
            }
        }

        if ($foundStudent !== null) {
            if (strpos($rawText, 'absent') !== false || 
                strpos($rawText, 'varala') !== false || 
                strpos($rawText, 'varavillai') !== false || 
                strpos($rawText, 'illa') !== false || 
                strpos($rawText, 'leave') !== false) {
                $studentStatus = 'Absent';
                $statusTamil = 'விடுப்பு பதிவு செய்யப்பட்டது';
                $statusEnglish = 'Absent';
            }

            $attendanceList = isset($db['attendance']['students']) ? $db['attendance']['students'] : [];
            $foundRecord = false;
            
            foreach ($attendanceList as &$item) {
                if ($item['date'] === $today && $item['studentId'] === $foundStudent['id']) {
                    $item['status'] = $studentStatus;
                    $item['remarks'] = 'Voice command (PHP Backend)';
                    $foundRecord = true;
                    break;
                }
            }
            if (!$foundRecord) {
                $attendanceList[] = [
                    "date" => $today,
                    "studentId" => $foundStudent['id'],
                    "status" => $studentStatus,
                    "remarks" => "Voice command (PHP Backend)"
                ];
            }

            $db['attendance']['students'] = $attendanceList;
            $result['success'] = true;
            $result['message'] = "Marked student " . $foundStudent['name'] . " as " . $studentStatus . ".";
            $result['speechText'] = [
                "en" => $foundStudent['name'] . " marked as " . $statusEnglish . ".",
                "ta" => $foundStudent['name'] . " " . $statusTamil . "."
            ];
            $result['action'] = [
                "type" => "MARK_ATTENDANCE",
                "studentId" => $foundStudent['id'],
                "status" => $studentStatus
            ];
        }
    }
}

// Log Voice Transaction
$newLog = [
    "id" => "LOG" . substr(time(), -4),
    "timestamp" => date('h:i:s A'),
    "voiceText" => $transcript,
    "success" => $result['success'],
    "message" => $result['message'],
    "actionType" => isset($result['action']['type']) ? $result['action']['type'] : 'UNKNOWN'
];

if (!isset($db['voiceLogs'])) {
    $db['voiceLogs'] = [];
}
array_unshift($db['voiceLogs'], $newLog);
$db['voiceLogs'] = array_slice($db['voiceLogs'], 0, 30); // limit to 30 logs

file_put_contents($db_file, json_encode($db, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

$spokenResponse = ($languagePreference === 'Tamil') ? $result['speechText']['ta'] : $result['speechText']['en'];

echo json_encode([
    "success" => $result['success'],
    "message" => $result['message'],
    "speechText" => $spokenResponse,
    "action" => $result['action'],
    "updatedData" => $db
]);
?>
