import json


async def test_get_username(jp_fetch):
    # When
    response = await jp_fetch("e2xgrader", "api", "course-info")

    # Then
    assert response.code == 200
    payload = json.loads(response.body)
    assert "username" in payload
    assert "course_id" in payload
    assert "root" in payload
