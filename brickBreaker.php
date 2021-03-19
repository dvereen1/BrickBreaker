<?php include_once('headNoNav.php');?> 
        <title>DJV Brick Breaker</title>
        <link rel = "stylesheet" href = "/CSS/allProjectsModal.css">
        <link rel = "stylesheet" type = "text/css" href ="brickBreaker.css">
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap" rel="stylesheet">
        </head>
        <body>
        <?php include_once("Classes/projectInfoModal.php");
            createProjectModal("Brick Breaker", $projectModalArr);
        ?>
            <header>
                    <nav>
                        <a class = "logo" href = "/#portfolio-">DJV</a>
                        <ul id = "menu">
                            <li class="menu-link">
                                <a href="/#portfolio-">
                                    Portfolio
                                </a>
                            </li>
                            <li class = "menu-link">
                                <a href ="https://github.com/dvereen1/BrickBreaker">View Code</a>
                            </li>
                        </ul>
                    
                    </nav>
                </header>  
            <section class = "djv-container">
                <h1 class = "game-title">
                    Brick Breaker
                </h1>
                <canvas width = 640 height = 400 id ="canvas"></canvas>
            </section>
        </body>
        <script src = "/JS/allProjectsModal.js"></script>
        <script src = "brickBreaker.js"></script>
    </html>