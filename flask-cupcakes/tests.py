from unittest import TestCase

from app import app
from models import db, Cupcake

# Use test database and don't clutter tests with SQL
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql:///cupcakes_test'
app.config['SQLALCHEMY_ECHO'] = False

# Make Flask errors be real errors, rather than HTML pages with error info
app.config['TESTING'] = True

db.drop_all()
db.create_all()


CUPCAKE_DATA = {
    "flavor": "TestFlavor",
    "size": "TestSize",
    "rating": 5,
    "image": "http://test.com/cupcake.jpg"
}

CUPCAKE_DATA_2 = {
    "flavor": "TestFlavor2",
    "size": "TestSize2",
    "rating": 10,
    "image": "http://test.com/cupcake2.jpg"
}

CUPCAKE_DATA_3 = {
    "id": 100,
    "flavor": "TestFlavor2",
    "size": "TestSize2",
    "rating": 10,
    "image": "http://test.com/cupcake2.jpg"
}

class CupcakeViewsTestCase(TestCase):
    """Tests for views of API."""

    def setUp(self):
        """Make demo data."""

        Cupcake.query.delete()

        cupcake = Cupcake(**CUPCAKE_DATA)
        cupcake3 = Cupcake(**CUPCAKE_DATA_3)
        db.session.add_all([cupcake, cupcake3])
        db.session.commit()

        self.cupcake = cupcake
        self.cupcake3 = cupcake3

    def tearDown(self):
        """Clean up fouled transactions."""

        db.session.rollback()

    def test_list_cupcakes(self):
        with app.test_client() as client:
            resp = client.get("/api/cupcakes")

            self.assertEqual(resp.status_code, 200)

            data = resp.json
            self.assertEqual(data, {
                "cupcakes": [
                    {
                        "id": self.cupcake.id,
                        "flavor": "TestFlavor",
                        "size": "TestSize",
                        "rating": 5,
                        "image": "http://test.com/cupcake.jpg"
                    },
                    {
                        "id": 100,
                        "flavor": "TestFlavor2",
                        "size": "TestSize2",
                        "rating": 10,
                        "image": "http://test.com/cupcake2.jpg"
                    }
                ]
            })

    def test_get_cupcake(self):
        with app.test_client() as client:
            url = f"/api/cupcakes/{self.cupcake.id}"
            resp = client.get(url)

            self.assertEqual(resp.status_code, 200)
            data = resp.json
            self.assertEqual(data, {
                "cupcake": {
                    "id": self.cupcake.id,
                    "flavor": "TestFlavor",
                    "size": "TestSize",
                    "rating": 5,
                    "image": "http://test.com/cupcake.jpg"
                }
            })

    def test_create_cupcake(self):
        with app.test_client() as client:
            url = "/api/cupcakes"
            resp = client.post(url, json=CUPCAKE_DATA_2)

            self.assertEqual(resp.status_code, 201)

            data = resp.json

            # don't know what ID we'll get, make sure it's an int & normalize
            self.assertIsInstance(data['cupcake']['id'], int)
            del data['cupcake']['id']

            self.assertEqual(data, {
                "cupcake": {
                    "flavor": "TestFlavor2",
                    "size": "TestSize2",
                    "rating": 10,
                    "image": "http://test.com/cupcake2.jpg"
                }
            })

            self.assertEqual(Cupcake.query.count(), 3)
    
    def test_patch_cupcake(self):
        with app.test_client() as client:
            url = "/api/cupcakes/100"
            new_data={
                    "flavor": "PatchedFlavor",
                    "id": 100,
                    "image": "http://test.com/cupcake3.jpg",
                    "rating": 100,
                    "size": "PatchedSize"
            }


            resp = client.patch(url, json=new_data)

            self.assertEqual(resp.status_code, 200)

            data = resp.json

            self.assertEqual(data, {
                "cupcake": {
                    "flavor": "PatchedFlavor",
                    "size": "PatchedSize",
                    "rating": 100,
                    "image": "http://test.com/cupcake3.jpg",
                    "id": 100
                }
            })

            self.assertEqual(Cupcake.query.count(), 2)
    
    def test_delete_cupcake(self):
        with app.test_client() as client:
            url = "/api/cupcakes/100"
            resp = client.delete(url)

            self.assertEqual(resp.status_code, 200)
            print(f"*******{resp.json}*******")

            self.assertEqual(Cupcake.query.count(), 1)