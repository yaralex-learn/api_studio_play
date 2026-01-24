from fastapi import APIRouter


api = APIRouter()


@api.get('/test/')
async def test():
    ...
