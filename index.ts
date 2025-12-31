import express, { Express, Request, Response } from "express";
import bodyParser from "body-parser";
import cors, { CorsOptions } from "cors";
import axios from "axios";

const corsOptions: CorsOptions = {
  origin: "*",
};

const app: Express = express();
const jsonParser = bodyParser.json();
const port = 3000;
app.use(cors(corsOptions));

app.use(express.static("static"));

app.get("/", (req: Request, res: Response) => {
  res.send("ну и что тебе тут понадобилось?");
});

const checkToken = async (token?: string) => {
  if (!token) {
    token = await axios.post("http://localhost:3000/auth");
  }
  return token;
};

app.post("/auth", jsonParser, async (req: Request, res: Response) => {
  try {
    const response = await axios.post(
      "https://msapi.top-academy.ru/api/v2/auth/login",
      {
        username: req.body.username,
        password: req.body.password,
        application_key:
          "6a56a5df2667e65aab73ce76d1dd737f7d1faef9c52e8b8c55ac75f565d8e8a6",
      },
      {
        headers: {
          Referer: "https://journal.top-academy.ru",
        },
      },
    );

    if (!response) {
      res.status(401).send("Unauthorized");
    }

    res.send({ token: response.data.access_token });
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

app.get("/marks", async (req: Request, res: Response) => {
  try {
    const token = await checkToken(req.headers.authorization);

    const response = await axios.get(
      "https://msapi.top-academy.ru/api/v2/progress/operations/student-visits",
      {
        headers: {
          "Content-Type": "application/json",
          Referer: "https://journal.top-academy.ru",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    res.send(response.data);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get("/exams", async (req: Request, res: Response) => {
  try {
    const token = await checkToken(req.headers.authorization);

    const response = await axios.get(
      "https://msapi.top-academy.ru/api/v2/progress/operations/student-exams",
      {
        headers: {
          "Content-Type": "application/json",
          Referer: "https://journal.top-academy.ru",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    res.send(response.data);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get("/schedule", async (req: Request, res: Response) => {
  try {
    const token = await checkToken(req.headers.authorization);
    const monday = req.query.monday;
    const sunday = req.query.sunday;

    if (!monday || !sunday) {
      res.status(400).send("Bad request");
      return;
    }

    const response = await axios.get(
      `https://msapi.top-academy.ru/api/v2/schedule/operations/get-by-date-range?date_start=${monday}&date_end=${sunday}`,
      {
        headers: {
          "Content-Type": "application/json",
          Referer: "https://journal.top-academy.ru",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    res.send(response.data);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get("/user", async (req: Request, res: Response) => {
  const token = await checkToken(req.headers.authorization);

  const response = await axios.get(
    "https://msapi.top-academy.ru/api/v2/settings/user-info",
    {
      headers: {
        "Content-Type": "application/json",
        Referer: "https://journal.top-academy.ru",
        Authorization: `Bearer ${token}`,
      },
    },
  );

  res.send(response.data);
});

app.get("/group_history", async (req: Request, res: Response) => {
  const token = await checkToken(req.headers.authorization);

  const response = await axios.get(
    "https://msapi.top-academy.ru/api/v2/homework/settings/group-history",
    {
      headers: {
        "Content-Type": "application/json",
        Referer: "https://journal.top-academy.ru",
        Authorization: `Bearer ${token}`,
      },
    },
  );

  res.send(response.data);
});

app.get("/homework", async (req: Request, res: Response) => {
  const token = await checkToken(req.headers.authorization);
  const groupId = req.query.group_id;
  const status = req.query.status;
  const page = req.query.page;

  const response = await axios.get(
    `https://msapi.top-academy.ru/api/v2/homework/operations/list?page=${page}&status=${status}&type=0&group_id=${groupId}`,
    {
      headers: {
        "Content-Type": "application/json",
        Referer: "https://journal.top-academy.ru",
        Authorization: `Bearer ${token}`,
      },
    },
  );

  res.send(response.data);
});

app.get("/labs", async (req: Request, res: Response) => {
  const token = await checkToken(req.headers.authorization);
  const groupId = req.query.group_id;
  const status = req.query.status;
  const page = req.query.page;

  const response = await axios.get(
    `https://msapi.top-academy.ru/api/v2/homework/operations/list?page=${page}&status=${status}&type=1&group_id=${groupId}`,
    {
      headers: {
        "Content-Type": "application/json",
        Referer: "https://journal.top-academy.ru",
        Authorization: `Bearer ${token}`,
      },
    },
  );

  res.send(response.data);
});

app.post("/homework", jsonParser, async (req: Request, res: Response) => {
  // const token = await checkToken(req.headers.authorization);
  // const form = formidable({ multiples: true });
  // form.parse(req, (err, fields, files) => {
  //   console.log(fields);
  //   console.log(files);
  // TODO: разобраться, что оно возвращает
  // });
});

app.delete("/homework:id", async (req: Request, res: Response) => {
  const token = await checkToken(req.headers.authorization);
  const { id } = req.params;

  const response = await axios.post(
    "https://msapi.top-academy.ru/api/v2/homework/operations/delete",
    { id },
    {
      headers: {
        "Content-Type": "application/json",
        Referer: "https://journal.top-academy.ru",
        Authorization: `Bearer ${token}`,
      },
    },
  );

  res.send(response.data);
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
